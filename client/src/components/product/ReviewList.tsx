import React, { useState } from 'react';
import { MessageSquarePlus, User } from 'lucide-react';
import { Review } from '../../types';
import { RatingStars } from '../common/RatingStars';
import { Button } from '../common/Button';
import { WriteReviewModal } from './WriteReviewModal';
import { useAuth } from '../../context/AuthContext';

interface ReviewListProps {
  productId: string;
  reviews: Review[];
  rating: number;
  reviewCount: number;
  onReviewAdded: () => void;
}

export const ReviewList: React.FC<ReviewListProps> = ({
  productId,
  reviews,
  rating,
  reviewCount,
  onReviewAdded,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { isAuthenticated } = useAuth();

  return (
    <div className="space-y-8">
      {/* Review Metrics Header */}
      <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="text-4xl font-extrabold text-slate-900">
            {rating.toFixed(1)}
          </div>
          <div>
            <RatingStars rating={rating} size="md" />
            <p className="text-xs text-slate-500 mt-1 font-medium">
              Based on {reviewCount} verified customer {reviewCount === 1 ? 'review' : 'reviews'}
            </p>
          </div>
        </div>

        <Button
          onClick={() => setIsModalOpen(true)}
          variant="outline"
          size="sm"
          leftIcon={<MessageSquarePlus className="w-4 h-4 text-indigo-600" />}
        >
          {isAuthenticated ? 'Write a Review' : 'Sign In to Review'}
        </Button>
      </div>

      {/* Reviews Stream */}
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-8">
            No customer reviews yet. Be the first to share your experience!
          </p>
        ) : (
          reviews.map((rev) => (
            <div
              key={rev.id}
              className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 font-bold text-xs flex items-center justify-center border border-slate-200">
                    <User className="w-4 h-4 text-slate-400" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-900">
                      {rev.user ? `${rev.user.firstName} ${rev.user.lastName}` : 'Verified Customer'}
                    </h5>
                    <p className="text-[10px] text-slate-400">
                      {new Date(rev.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                </div>

                <RatingStars rating={rev.rating} size="sm" />
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">{rev.comment}</p>
            </div>
          ))
        )}
      </div>

      {/* Review Submission Modal */}
      <WriteReviewModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        productId={productId}
        onSuccess={() => {
          setIsModalOpen(false);
          onReviewAdded();
        }}
      />
    </div>
  );
};
