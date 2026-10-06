import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal } from '../common/Modal';
import { RatingStars } from '../common/RatingStars';
import { Button } from '../common/Button';
import { productsApi } from '../../api/products.api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

interface WriteReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId: string;
  onSuccess: () => void;
}

export const WriteReviewModal: React.FC<WriteReviewModalProps> = ({
  isOpen,
  onClose,
  productId,
  onSuccess,
}) => {
  const { isAuthenticated } = useAuth();
  const { success, error: toastError } = useToast();
  const navigate = useNavigate();

  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isAuthenticated && isOpen) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Sign In Required" maxWidth="sm">
        <div className="text-center space-y-4 py-2">
          <p className="text-sm text-slate-600">
            Please sign in with your NexaCart account to write and publish a verified product review.
          </p>
          <div className="flex gap-2 justify-center">
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                onClose();
                navigate('/login');
              }}
            >
              Go to Sign In
            </Button>
          </div>
        </div>
      </Modal>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim() || comment.length < 5) {
      toastError('Please write at least 5 characters in your review');
      return;
    }

    try {
      setIsSubmitting(true);
      await productsApi.addReview(productId, { rating, comment });
      success('Review submitted successfully! Thank you for your feedback.');
      setComment('');
      setRating(5);
      onSuccess();
    } catch (err: any) {
      toastError(err.message || 'Failed to submit review');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Write a Product Review" maxWidth="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            Overall Rating
          </label>
          <div className="flex items-center gap-3">
            <RatingStars
              rating={rating}
              size="lg"
              interactive
              onRatingChange={(newRating) => setRating(newRating)}
            />
            <span className="text-xs font-bold text-indigo-600">
              {rating === 5
                ? '5 - Exceptional'
                : rating === 4
                ? '4 - Very Good'
                : rating === 3
                ? '3 - Average'
                : rating === 2
                ? '2 - Subpar'
                : '1 - Poor'}
            </span>
          </div>
        </div>

        <div>
          <label htmlFor="review-comment" className="block text-xs font-bold text-slate-700 mb-1.5">
            Your Review Feedback
          </label>
          <textarea
            id="review-comment"
            rows={4}
            required
            placeholder="Share what you liked, how it performs, and if you would recommend it..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
          />
          <span className="text-[10px] text-slate-400">Minimum 5 characters</span>
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
          <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm" isLoading={isSubmitting}>
            Submit Review
          </Button>
        </div>
      </form>
    </Modal>
  );
};
