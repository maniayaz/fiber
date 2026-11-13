"use client";

import { useState, useSyncExternalStore, type FormEvent } from "react";
import { Star } from "lucide-react";
import { useAppPreferences } from "@/components/app-shell";

type Review = {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
};

const storageKey = "fiber-link-reviews";
const maxCommentLength = 500;
const reviewChangeEvent = "fiber-link-reviews-change";

type ReviewsSnapshot = {
  reviews: Review[];
  error: "storage" | "invalid" | null;
};

const emptyReviewsSnapshot: ReviewsSnapshot = { reviews: [], error: null };
let cachedReviewsSnapshot: ReviewsSnapshot | null = null;

const copy = {
  en: {
    label: "Customer feedback",
    title: "Share your review",
    description: "Tell us about your experience with Fiber Link.",
    localNote: "Demo only: reviews are saved in this browser and are not shared with Fiber Link or other visitors.",
    rating: "Your rating",
    comment: "Your comment",
    placeholder: "Write your review (up to 500 characters)",
    submit: "Share review",
    requiredRating: "Please choose a star rating before sharing your review.",
    requiredComment: "Please write a comment before sharing your review.",
    emptyTitle: "No reviews on this browser yet",
    emptyDescription: "Your review will appear here after you share it.",
    reviews: "Reviews on this browser",
    saved: "Your review was saved in this browser.",
    storageError: "Reviews could not be loaded or saved in this browser. Check your browser storage settings and try again.",
    invalidData: "Saved review data is invalid. Reviews were not changed.",
    star: "star",
    stars: "stars",
  },
  "roman-ur": {
    label: "Customers ki rai",
    title: "Apna review share karein",
    description: "Fiber Link ke saath apna tajurba batayein.",
    localNote: "Sirf demo: reviews isi browser mein save hote hain. Yeh Fiber Link ya doosre visitors ke saath share nahi hote.",
    rating: "Aap ki rating",
    comment: "Aap ka comment",
    placeholder: "Apna review likhein (500 characters tak)",
    submit: "Review share karein",
    requiredRating: "Review share karne se pehle star rating chunein.",
    requiredComment: "Review share karne se pehle apna comment likhein.",
    emptyTitle: "Is browser mein abhi koi review nahi",
    emptyDescription: "Share karne ke baad aap ka review yahan nazar aayega.",
    reviews: "Is browser ke reviews",
    saved: "Aap ka review is browser mein save ho gaya.",
    storageError: "Reviews is browser mein load ya save nahi ho sake. Browser storage settings check karke dobara koshish karein.",
    invalidData: "Saved review data durust nahi. Reviews mein koi tabdeeli nahi ki gayi.",
    star: "star",
    stars: "stars",
  },
} as const;

function isReview(value: unknown): value is Review {
  if (typeof value !== "object" || value === null) return false;
  const review = value as Record<string, unknown>;
  return (
    typeof review.id === "string" &&
    typeof review.rating === "number" &&
    Number.isInteger(review.rating) &&
    review.rating >= 1 &&
    review.rating <= 5 &&
    typeof review.comment === "string" &&
    review.comment.length > 0 &&
    review.comment.length <= maxCommentLength &&
    typeof review.createdAt === "string" &&
    !Number.isNaN(Date.parse(review.createdAt))
  );
}

function getReviewsSnapshot(): ReviewsSnapshot {
  if (cachedReviewsSnapshot) return cachedReviewsSnapshot;

  let savedReviews: string | null;
  try {
    savedReviews = window.localStorage.getItem(storageKey);
  } catch {
    cachedReviewsSnapshot = { reviews: [], error: "storage" };
    return cachedReviewsSnapshot;
  }

  if (!savedReviews) {
    cachedReviewsSnapshot = emptyReviewsSnapshot;
    return cachedReviewsSnapshot;
  }

  try {
    const parsed: unknown = JSON.parse(savedReviews);
    if (!Array.isArray(parsed) || !parsed.every(isReview)) {
      cachedReviewsSnapshot = { reviews: [], error: "invalid" };
    } else {
      cachedReviewsSnapshot = { reviews: parsed, error: null };
    }
  } catch {
    cachedReviewsSnapshot = { reviews: [], error: "invalid" };
  }
  return cachedReviewsSnapshot;
}

function getServerReviewsSnapshot() {
  return emptyReviewsSnapshot;
}

function subscribeToReviews(onChange: () => void) {
  function handleChange() {
    cachedReviewsSnapshot = null;
    onChange();
  }

  window.addEventListener("storage", handleChange);
  window.addEventListener(reviewChangeEvent, handleChange);
  return () => {
    window.removeEventListener("storage", handleChange);
    window.removeEventListener(reviewChangeEvent, handleChange);
  };
}

export function ReviewsSection() {
  const locale = useAppPreferences();
  const t = copy[locale];
  const snapshot = useSyncExternalStore(
    subscribeToReviews,
    getReviewsSnapshot,
    getServerReviewsSnapshot,
  );
  const { reviews } = snapshot;
  const storageError =
    snapshot.error === "invalid"
      ? t.invalidData
      : snapshot.error === "storage"
        ? t.storageError
        : "";
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setError("");

    if (rating === 0) {
      setError(t.requiredRating);
      return;
    }

    const trimmedComment = comment.trim();
    if (!trimmedComment) {
      setError(t.requiredComment);
      return;
    }

    const newReview: Review = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      rating,
      comment: trimmedComment,
      createdAt: new Date().toISOString(),
    };
    const nextReviews = [newReview, ...reviews];

    try {
      window.localStorage.setItem(storageKey, JSON.stringify(nextReviews));
      cachedReviewsSnapshot = { reviews: nextReviews, error: null };
      window.dispatchEvent(new Event(reviewChangeEvent));
      setRating(0);
      setComment("");
      setMessage(t.saved);
    } catch {
      cachedReviewsSnapshot = { reviews, error: "storage" };
      window.dispatchEvent(new Event(reviewChangeEvent));
      setError(t.storageError);
    }
  }

  return (
    <section className="reviews-section" id="reviews">
      <div className="page-container reviews-layout">
        <div className="reviews-intro">
          <span className="section-kicker">{t.label}</span>
          <h2>{t.title}</h2>
          <p>{t.description}</p>
          <p className="reviews-local-note">{t.localNote}</p>
        </div>

        <div className="reviews-content">
          <form className="review-form" onSubmit={handleSubmit}>
            <fieldset className="review-rating">
              <legend>{t.rating}</legend>
              <div className="review-stars" role="group" aria-label={t.rating}>
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    aria-label={`${value} ${value === 1 ? t.star : t.stars}`}
                    aria-pressed={rating === value}
                    className={value <= rating ? "review-star selected" : "review-star"}
                    key={value}
                    onClick={() => setRating(value)}
                    type="button"
                  >
                    <Star aria-hidden="true" fill="currentColor" size={23} />
                  </button>
                ))}
              </div>
            </fieldset>
            <label className="review-comment-label" htmlFor="review-comment">{t.comment}</label>
            <textarea
              id="review-comment"
              maxLength={maxCommentLength}
              onChange={(event) => setComment(event.target.value)}
              placeholder={t.placeholder}
              required
              rows={4}
              value={comment}
            />
            <div className="review-form-footer">
              <span>{comment.length}/{maxCommentLength}</span>
              <button className="button button-small" disabled={snapshot.error !== null} type="submit">
                {t.submit}
              </button>
            </div>
            {(storageError || error) && (
              <p className="review-message error" role="alert">{storageError || error}</p>
            )}
            {message && <p className="review-message" role="status">{message}</p>}
          </form>

          <div className="review-list" aria-live="polite">
            <h3>{t.reviews} <span>({reviews.length})</span></h3>
            {reviews.length === 0 ? (
              <div className="review-empty">
                <strong>{t.emptyTitle}</strong>
                <p>{t.emptyDescription}</p>
              </div>
            ) : (
              reviews.map((review) => (
                <article className="review-card" key={review.id}>
                  <div className="review-card-heading">
                    <span className="review-card-stars" aria-label={`${review.rating} ${review.rating === 1 ? t.star : t.stars}`}>
                      {Array.from({ length: 5 }, (_, index) => (
                        <Star
                          aria-hidden="true"
                          fill={index < review.rating ? "currentColor" : "none"}
                          key={index}
                          size={15}
                        />
                      ))}
                    </span>
                    <time dateTime={review.createdAt}>
                      {new Intl.DateTimeFormat(locale === "en" ? "en" : "ur-PK", {
                        dateStyle: "medium",
                      }).format(new Date(review.createdAt))}
                    </time>
                  </div>
                  <p>{review.comment}</p>
                </article>
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
