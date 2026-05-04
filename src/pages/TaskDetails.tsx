import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  doc, 
  getDoc, 
  updateDoc, 
  collection, 
  addDoc, 
  serverTimestamp, 
  onSnapshot,
  increment,
  runTransaction,
  setDoc,
  query,
  where
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { motion } from 'motion/react';
import { 
  Clock, 
  DollarSign, 
  Send, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  MessageSquare,
  ArrowLeft,
  User,
  ShieldAlert,
  Star
} from 'lucide-react';

const TaskDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, userData } = useAuth();
  
  const [task, setTask] = useState<any>(null);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [proof, setProof] = useState('');
  const [hasReviewed, setHasReviewed] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');

  useEffect(() => {
    if (!id) return;
    
    const taskRef = doc(db, 'tasks', id);
    const unsubscribeTask = onSnapshot(taskRef, (docSnap) => {
      if (docSnap.exists()) {
        setTask({ id: docSnap.id, ...docSnap.data() });
      } else {
        navigate('/marketplace');
      }
      setLoading(false);
    });

    const subQuery = collection(db, 'tasks', id, 'submissions');
    const unsubscribeSubs = onSnapshot(subQuery, (snapshot) => {
      setSubmissions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    let unsubReview = () => {};
    if (user) {
      const q = query(
        collection(db, 'reviews'),
        where('taskId', '==', id),
        where('reviewerId', '==', user.uid)
      );
      unsubReview = onSnapshot(q, (snap) => {
        setHasReviewed(!snap.empty);
      });
    }

    return () => {
      unsubscribeTask();
      unsubscribeSubs();
      unsubReview();
    };
  }, [id, navigate, user]);

  const handleAcceptTask = async () => {
    if (!id || !user) return;
    setSubmitting(true);
    try {
      await updateDoc(doc(db, 'tasks', id), {
        workerId: user.uid,
        status: 'in_progress',
        updatedAt: serverTimestamp()
      });

      // Notify task creator
      await addDoc(collection(db, 'users', task.creatorId, 'notifications'), {
        userId: task.creatorId,
        title: 'New worker on your task! 🏃‍♂️',
        message: `Someone has started working on "${task.title}".`,
        type: 'task',
        read: false,
        createdAt: serverTimestamp()
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `tasks/${id}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitProof = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !user || !proof) return;
    setSubmitting(true);
    try {
      await addDoc(collection(db, 'tasks', id, 'submissions'), {
        taskId: id,
        workerId: user.uid,
        content: proof,
        status: 'pending',
        createdAt: serverTimestamp()
      });

      // Notify task creator
      await addDoc(collection(db, 'users', task.creatorId, 'notifications'), {
        userId: task.creatorId,
        title: 'New submission received! 📬',
        message: `Your task "${task.title}" has a new proof submission waiting for approval.`,
        type: 'task',
        read: false,
        createdAt: serverTimestamp()
      });

      setProof('');
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `tasks/${id}/submissions`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleApproveSubmission = async (submissionId: string, workerId: string) => {
    if (!id || !user) return;
    setSubmitting(true);
    try {
      // Transaction to update task status AND balances
      await runTransaction(db, async (transaction) => {
        const taskRef = doc(db, 'tasks', id);
        const workerRef = doc(db, 'users', workerId);
        const creatorRef = doc(db, 'users', user.uid);
        const subRef = doc(db, 'tasks', id, 'submissions', submissionId);

        const taskDoc = await transaction.get(taskRef);
        if (!taskDoc.exists() || taskDoc.data().status === 'completed') {
           throw "Task already completed";
        }

        const price = taskDoc.data().price;

        transaction.update(taskRef, { status: 'completed', updatedAt: serverTimestamp() });
        transaction.update(workerRef, { balance: increment(price) });
        transaction.update(subRef, { status: 'approved' });
        
        // Record transaction
        const txRef = doc(collection(db, 'transactions'));
        transaction.set(txRef, {
           userId: workerId,
           amount: price,
           type: 'earning',
           taskId: id,
           status: 'completed',
           createdAt: serverTimestamp()
        });

        // Notify worker (cannot use addDoc in transaction directly easily, but we can do it after or use transaction.set)
        const workerNotifRef = doc(collection(db, 'users', workerId, 'notifications'));
        transaction.set(workerNotifRef, {
           userId: workerId,
           title: 'Payment Received! 💰',
           message: `You earned $${price.toFixed(2)} for completing "${taskDoc.data().title}".`,
           type: 'wallet',
           read: false,
           createdAt: serverTimestamp()
        });
      });
      alert('Task approved and worker paid!');
    } catch (err) {
      console.error(err);
      alert('Transaction failed: ' + err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleLeaveReview = async (e: React.FormEvent, rating: number, comment: string) => {
    e.preventDefault();
    if (!id || !user || !task) return;
    setSubmitting(true);
    
    const revieweeId = isCreator ? task.workerId : task.creatorId;
    
    try {
      await runTransaction(db, async (transaction) => {
        const revieweeRef = doc(db, 'users', revieweeId);
        const revieweeSnap = await transaction.get(revieweeRef);
        
        if (!revieweeSnap.exists()) throw "User not found";
        
        const currentData = revieweeSnap.data();
        const currentRating = currentData.rating || 0;
        const currentCount = currentData.reviewCount || 0;
        
        const newCount = currentCount + 1;
        const newRating = ((currentRating * currentCount) + rating) / newCount;
        
        const reviewRef = doc(collection(db, 'reviews'));
        transaction.set(reviewRef, {
          taskId: id,
          reviewerId: user.uid,
          revieweeId: revieweeId,
          rating,
          comment,
          createdAt: serverTimestamp()
        });
        
        transaction.update(revieweeRef, {
          rating: newRating,
          reviewCount: newCount
        });
      });
      alert('Review submitted!');
    } catch (err) {
      console.error(err);
      alert('Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStartChat = async () => {
    if (!user || !task) return;
    const participantIds = [user.uid, task.creatorId].sort();
    const roomId = participantIds.join('_');
    
    try {
      const roomRef = doc(db, 'chatRooms', roomId);
      const roomSnap = await getDoc(roomRef);
      
      if (!roomSnap.exists()) {
        await setDoc(roomRef, {
          participants: participantIds,
          lastMessage: 'Chat started',
          lastMessageTime: serverTimestamp(),
          createdAt: serverTimestamp()
        });
      }
      
      navigate(`/chat/${roomId}`);
    } catch (err) {
      console.error(err);
      alert('Failed to start chat');
    }
  };

  if (loading) return <div className="p-12 text-center">Loading task details...</div>;
  if (!task) return null;

  const isCreator = user?.uid === task.creatorId;
  const isWorker = user?.uid === task.workerId;
  const canAccept = task.status === 'open' && !isCreator;
  const canSubmit = task.status === 'in_progress' && isWorker;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-neutral-500 hover:text-neutral-900 mb-8 font-bold text-sm">
        <ArrowLeft size={18} /> Back
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-3xl p-8 shadow-sm border border-neutral-100">
            <div className="flex items-center justify-between mb-6">
              <span className="px-4 py-1 rounded-full bg-orange-100 text-orange-600 font-bold text-xs uppercase tracking-widest">{task.category || 'General'}</span>
              <div className="flex items-center gap-1 font-black text-2xl text-neutral-900">
                <DollarSign size={20} className="text-orange-600" />
                {task.price?.toFixed(2)}
              </div>
            </div>
            
            <h1 className="text-3xl font-extrabold text-neutral-900 mb-4">{task.title}</h1>
            <div className="flex items-center gap-6 text-sm text-neutral-500 font-medium mb-8">
               <div className="flex items-center gap-2">
                  <User size={16} /> 
                  <span>Posted by: <span className="text-neutral-900">{isCreator ? 'You' : 'Creator'}</span></span>
               </div>
               <div className="flex items-center gap-2">
                  <Clock size={16} />
                  <span>{new Date(task.createdAt?.toDate?.() || Date.now()).toLocaleDateString()}</span>
               </div>
            </div>

            <div className="prose prose-neutral max-w-none">
              <h3 className="text-lg font-bold text-neutral-900 mb-2">Description</h3>
              <p className="text-neutral-600 whitespace-pre-wrap">{task.description}</p>
            </div>
          </motion.div>

          {/* Submissions Section */}
          { (isCreator || isWorker) && (
            <section className="space-y-4">
              <h2 className="text-xl font-bold text-neutral-900">Task Submissions</h2>
              {submissions.length === 0 ? (
                <div className="p-8 text-center bg-neutral-50 rounded-3xl border border-dashed border-neutral-200 text-neutral-400">
                  No submissions yet.
                </div>
              ) : (
                <div className="grid gap-4">
                  {submissions.map((sub) => (
                    <div key={sub.id} className="bg-white rounded-2xl p-6 border border-neutral-100 shadow-sm">
                       <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2 text-xs font-bold text-neutral-400 uppercase tracking-widest">
                             {sub.status === 'approved' ? <CheckCircle2 className="text-emerald-500" size={14} /> : <Clock size={14} />}
                             {sub.status}
                          </div>
                          <span className="text-xs text-neutral-400">{new Date(sub.createdAt?.toDate?.() || Date.now()).toLocaleString()}</span>
                       </div>
                       <p className="text-neutral-700 bg-neutral-50 p-4 rounded-xl border border-neutral-100 mb-4">{sub.content}</p>
                       
                       {isCreator && sub.status === 'pending' && task.status !== 'completed' && (
                         <div className="flex gap-2">
                           <button 
                            onClick={() => handleApproveSubmission(sub.id, sub.workerId)}
                            disabled={submitting}
                            className="flex-1 bg-emerald-600 text-white font-bold py-2 rounded-xl text-sm hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2"
                           >
                             <CheckCircle2 size={16} /> Approve & Pay
                           </button>
                           <button className="px-4 bg-red-50 text-red-600 font-bold py-2 rounded-xl text-sm hover:bg-red-100 transition-colors">
                             Reject
                           </button>
                         </div>
                       )}
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}
        </div>

        {/* Action Sidebar */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-neutral-100 shadow-sm sticky top-24">
            <h3 className="text-sm font-bold text-neutral-900 uppercase tracking-widest mb-4">Status</h3>
            <div className={`mb-6 p-4 rounded-2xl flex items-center gap-3 font-bold text-sm ${
              task.status === 'open' ? 'bg-emerald-50 text-emerald-600' : 
              task.status === 'in_progress' ? 'bg-blue-50 text-blue-600' :
              'bg-neutral-100 text-neutral-500'
            }`}>
              {task.status === 'open' ? <AlertCircle size={20} /> : <Clock size={20} />}
              {task.status.replace('_', ' ').toUpperCase()}
            </div>

            {canAccept && (
              <button 
                onClick={handleAcceptTask}
                disabled={submitting}
                className="w-full bg-neutral-900 text-white font-bold py-4 rounded-2xl hover:bg-neutral-800 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                Accept Task
              </button>
            )}

            {canSubmit && (
              <form onSubmit={handleSubmitProof} className="space-y-4">
                <textarea 
                  placeholder="Paste your proof here (links, completion text, etc.)"
                  className="w-full h-32 rounded-2xl border border-neutral-200 bg-neutral-50 p-4 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                  required
                  value={proof}
                  onChange={(e) => setProof(e.target.value)}
                />
                <button 
                  type="submit" 
                  disabled={submitting}
                  className="w-full bg-orange-600 text-white font-bold py-4 rounded-2xl hover:bg-orange-500 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Send size={18} /> Submit Proof
                </button>
              </form>
            )}

            {task.status === 'completed' && (
              <div className="text-center py-4 text-emerald-600 font-bold flex flex-col items-center gap-2">
                 <CheckCircle2 size={40} />
                 Task Completed
              </div>
            )}

            <div className="mt-8 pt-8 border-t border-neutral-100">
               <button 
                onClick={handleStartChat}
                className="w-full flex items-center justify-center gap-2 text-neutral-500 hover:text-neutral-900 font-bold text-sm transition-colors"
               >
                  <MessageSquare size={18} /> Chat with {isCreator ? 'Worker' : 'Creator'}
               </button>
            </div>
            
            <div className="mt-4 flex items-center gap-2 bg-blue-50 p-3 rounded-xl border border-blue-100 text-[10px] text-blue-700 font-bold uppercase tracking-wider">
               <ShieldAlert size={14} />
               Secure Escrow Active
            </div>
          </div>
          {/* Review Section */}
          {task.status === 'completed' && (isCreator || isWorker) && !hasReviewed && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-12 p-8 rounded-[2.5rem] bg-orange-50 border border-orange-100"
            >
              <h3 className="text-xl font-bold text-neutral-900 mb-2">Leave a Review</h3>
              <p className="text-neutral-500 text-sm mb-6">How was your experience working with {isCreator ? 'the worker' : 'the creator'}?</p>
              
              <form onSubmit={(e) => handleLeaveReview(e, reviewRating, reviewComment)} className="space-y-4">
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      className={`p-2 rounded-xl transition-all ${
                        reviewRating >= star ? 'text-orange-500 bg-orange-100' : 'text-neutral-300 bg-white'
                      }`}
                    >
                      <Star size={24} fill={reviewRating >= star ? 'currentColor' : 'none'} />
                    </button>
                  ))}
                </div>
                
                <textarea
                  placeholder="Share details of your experience..."
                  className="w-full px-6 py-4 rounded-2xl bg-white border-none font-medium text-neutral-900 h-24 focus:ring-2 focus:ring-orange-500/20"
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  required
                />
                
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-neutral-900 text-white font-black py-4 rounded-3xl hover:bg-neutral-800 transition-all active:scale-95 disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : 'Post Review'}
                </button>
              </form>
            </motion.div>
          )}

          {hasReviewed && (
            <div className="mt-8 p-6 rounded-3xl bg-neutral-50 text-center text-neutral-500 font-medium border border-dashed border-neutral-200">
               Review posted. Thank you!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskDetails;
