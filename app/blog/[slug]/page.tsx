'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, User, Clock, Share2, Tag, Loader2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { toast } from 'sonner';
import { useLanguage } from '@/lib/lang/LanguageContext';
import { pickLocalizedList, pickLocalizedText } from '@/lib/lang/localize';

interface BlogPost {
  id: string;
  title: string;
  titleBn?: string | null;
  slug: string;
  excerpt: string;
  excerptBn?: string | null;
  content: string;
  contentBn?: string | null;
  coverImage: string | null;
  category: string;
  categoryBn?: string | null;
  tags: string[];
  tagsBn?: string[];
  author: string;
  status: 'DRAFT' | 'PUBLISHED';
  createdAt: string;
  updatedAt: string;
}

function formatDate(iso: string, locale: 'bn-BD' | 'en-US') {
  return new Date(iso).toLocaleDateString(locale, { year: 'numeric', month: 'long', day: 'numeric' });
}

function estimateReadTime(content: string, isBN: boolean) {
  const wordsPerMinute = 200;
  const wordCount = content.split(/\s+/).length;
  const readTime = Math.ceil(wordCount / wordsPerMinute);
  return isBN ? `${readTime} মিনিট` : `${readTime} min`;
}

export default function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { language } = useLanguage();
  const isBN = language === 'BN';
  const locale = isBN ? 'bn-BD' : 'en-US';
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);
  const [slug, setSlug] = useState<string>('');
  const localizedTitle = post ? pickLocalizedText(language, post.title, post.titleBn) : '';
  const localizedExcerpt = post ? pickLocalizedText(language, post.excerpt, post.excerptBn) : '';
  const localizedContent = post ? pickLocalizedText(language, post.content, post.contentBn) : '';
  const localizedCategory = post ? pickLocalizedText(language, post.category, post.categoryBn) : '';
  const localizedTags = post ? pickLocalizedList(language, post.tags, post.tagsBn) : [];

  useEffect(() => {
    params.then((resolvedParams) => {
      setSlug(resolvedParams.slug);
    });
  }, [params]);

  useEffect(() => {
    if (!slug) return;

    const fetchPost = async () => {
      try {
        const response = await fetch(`/api/v1/blog/${slug}`);
        if (!response.ok) {
          if (response.status === 404) {
            toast.error(isBN ? 'ব্লগ পোস্ট পাওয়া যায়নি' : 'Blog post not found');
          } else {
            toast.error(isBN ? 'ব্লগ পোস্ট লোড করা যায়নি' : 'Could not load blog post');
          }
          return;
        }
        const data = await response.json();
        setPost(data);

        // Fetch related posts
        const allPostsResponse = await fetch('/api/v1/cms/blog', { cache: 'no-store' });
        if (allPostsResponse.ok) {
          const allPosts = await allPostsResponse.json();
          const published = allPosts.filter((p: BlogPost) => p.status === 'PUBLISHED' && p.id !== data.id);
          const related = published
            .filter((p: BlogPost) => p.category === data.category || p.tags.some((tag: string) => data.tags.includes(tag)))
            .slice(0, 3);
          setRelatedPosts(related);
        }
      } catch (error) {
        console.error('Blog post fetch error:', error);
        toast.error(isBN ? 'ব্লগ পোস্ট লোড করা যায়নি' : 'Could not load blog post');
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [slug, isBN]);

  const handleShare = () => {
    if (navigator.share && post) {
      navigator.share({
        title: localizedTitle,
        text: localizedExcerpt,
        url: window.location.href,
      }).catch(() => {
        // Fallback to clipboard
        navigator.clipboard.writeText(window.location.href);
        toast.success(isBN ? 'লিংক কপি করা হয়েছে!' : 'Link copied!');
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success(isBN ? 'লিংক কপি করা হয়েছে!' : 'Link copied!');
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">{isBN ? 'ব্লগ পোস্ট লোড হচ্ছে...' : 'Loading blog post...'}</p>
        </div>
      </main>
    );
  }

  if (!post) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">{isBN ? 'পোস্ট পাওয়া যায়নি' : 'Post not found'}</h1>
          <p className="text-gray-600 mb-6">
            {isBN
              ? 'আপনি যে ব্লগ পোস্টটি খুঁজছেন সেটি নেই বা সরিয়ে ফেলা হয়েছে।'
              : 'The blog post you are looking for does not exist or has been removed.'}
          </p>
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 bg-red-600 text-white px-6 py-3 rounded-full font-semibold hover:bg-red-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {isBN ? 'ব্লগে ফিরে যান' : 'Back to blog'}
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white pb-16 lg:pb-0">
      {/* Hero Section */}
      <section className="py-20 lg:py-32 bg-linear-to-br from-red-50 via-white to-rose-50">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          {/* Category Badge */}
          {post.category && (
            <span className="inline-block px-4 py-1.5 bg-red-100 text-red-600 rounded-full text-sm font-semibold mb-6">
              {localizedCategory}
            </span>
          )}
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">
            {localizedTitle}
          </h1>
          <p className="text-xl text-gray-600 mb-8 leading-relaxed max-w-3xl mx-auto">
            {localizedExcerpt}
          </p>
          {/* Meta Information */}
          <div className="flex flex-wrap items-center justify-center gap-6 mb-4">
            <div className="flex items-center gap-2 text-gray-600">
              <User className="w-4 h-4" />
              <span className="text-sm font-medium">{isBN ? 'লেখক' : 'Author'}: {post.author}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Calendar className="w-4 h-4" />
              <span className="text-sm">{formatDate(post.createdAt, locale)}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Clock className="w-4 h-4" />
              <span className="text-sm">{estimateReadTime(localizedContent, isBN)}</span>
            </div>
            <button
              onClick={handleShare}
              className="flex items-center gap-2 text-gray-600 hover:text-red-600 transition-colors"
            >
              <Share2 className="w-4 h-4" />
              <span className="text-sm font-medium">{isBN ? 'শেয়ার' : 'Share'}</span>
            </button>
          </div>
        </div>
      </section>

      {/* Article */}
      <article className="max-w-4xl mx-auto px-6 lg:px-8 py-12">
        {/* Cover Image */}
        {post.coverImage && (
          <div className="relative w-full h-64 md:h-80 mb-12 rounded-2xl overflow-hidden shadow-lg">
            <Image
              src={post.coverImage}
              alt={localizedTitle}
              fill
              className="object-cover"
              priority
            />
          </div>
        )}

        {/* Content */}
        <div className="prose prose-lg max-w-none">
          <div 
            className="text-gray-700 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: localizedContent }}
          />
        </div>

        {/* Tags */}
        {localizedTags.length > 0 && (
          <div className="mt-12 pt-8 border-t border-gray-200">
            <div className="flex items-center gap-2 mb-4">
              <Tag className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-900">{isBN ? 'ট্যাগ:' : 'Tags:'}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {localizedTags.map((tag) => (
                <span
                  key={tag}
                  className="bg-gray-100 text-gray-700 text-sm px-3 py-1.5 rounded-full hover:bg-gray-200 transition-colors"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </article>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <section className="bg-gray-50 py-16">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8 text-center">
              {isBN ? 'সম্পর্কিত পোস্ট' : 'Related Posts'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {relatedPosts.map((relatedPost) => {
                const title = pickLocalizedText(language, relatedPost.title, relatedPost.titleBn);
                const excerpt = pickLocalizedText(language, relatedPost.excerpt, relatedPost.excerptBn);
                const category = pickLocalizedText(language, relatedPost.category, relatedPost.categoryBn);
                return (
                <article
                  key={relatedPost.id}
                  className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="relative h-48 bg-gray-100">
                    {relatedPost.coverImage ? (
                      <Image
                        src={relatedPost.coverImage}
                        alt={title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                        {isBN ? 'কোনো ছবি নেই' : 'No image available'}
                      </div>
                    )}
                    {relatedPost.category && (
                      <span className="absolute top-3 left-3 bg-red-600 text-white text-xs font-semibold px-2 py-1 rounded-full">
                        {category}
                      </span>
                    )}
                  </div>
                  <div className="p-6">
                    <div className="text-xs text-gray-500 mb-3 flex items-center gap-2">
                      <Calendar className="w-3 h-3" />
                      {formatDate(relatedPost.createdAt, locale)}
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-3 line-clamp-2">
                      {title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {excerpt}
                    </p>
                    <Link
                      href={`/blog/${relatedPost.slug}`}
                      className="inline-block bg-red-600 text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-red-700 transition-colors"
                    >
                      {isBN ? 'আরও পড়ুন' : 'Read more'}
                    </Link>
                  </div>
                </article>
                );
              })}
            </div>
          </div>
        </section>
      )}

    </main>
  );
}
