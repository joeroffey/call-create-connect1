import React, { useState, useEffect } from 'react';
import { Quote, RefreshCw } from 'lucide-react';
import BaseWidget from '../BaseWidget';
import { BaseWidgetProps } from '../types';
import { Button } from '@/components/ui/button';

interface MotivationalQuote {
  text: string;
  author: string;
  category: string;
}

const MotivationalQuotesWidget: React.FC<BaseWidgetProps> = (props) => {
  const [currentQuote, setCurrentQuote] = useState<MotivationalQuote | null>(null);
  const [loading, setLoading] = useState(false);

  const motivationalQuotes: MotivationalQuote[] = [
    {
      text: "The way to get started is to quit talking and begin doing.",
      author: "Walt Disney",
      category: "productivity"
    },
    {
      text: "Success is not final, failure is not fatal: it is the courage to continue that counts.",
      author: "Winston Churchill",
      category: "persistence"
    },
    {
      text: "Innovation distinguishes between a leader and a follower.",
      author: "Steve Jobs",
      category: "innovation"
    },
    {
      text: "The only way to do great work is to love what you do.",
      author: "Steve Jobs",
      category: "passion"
    },
    {
      text: "Don't be afraid to give up the good to go for the great.",
      author: "John D. Rockefeller",
      category: "excellence"
    },
    {
      text: "The future depends on what we do in the present.",
      author: "Mahatma Gandhi",
      category: "action"
    },
    {
      text: "It is during our darkest moments that we must focus to see the light.",
      author: "Aristotle",
      category: "resilience"
    },
    {
      text: "Believe you can and you're halfway there.",
      author: "Theodore Roosevelt",
      category: "confidence"
    },
    {
      text: "The only impossible journey is the one you never begin.",
      author: "Tony Robbins",
      category: "beginning"
    },
    {
      text: "Progress, not perfection, is the goal.",
      author: "Unknown",
      category: "progress"
    },
    {
      text: "Your limitation—it's only your imagination.",
      author: "Unknown",
      category: "mindset"
    },
    {
      text: "Great things never come from comfort zones.",
      author: "Unknown",
      category: "growth"
    },
    {
      text: "Dream it. Wish it. Do it.",
      author: "Unknown",
      category: "action"
    },
    {
      text: "Success doesn't just find you. You have to go out and get it.",
      author: "Unknown",
      category: "success"
    },
    {
      text: "The harder you work for something, the greater you'll feel when you achieve it.",
      author: "Unknown",
      category: "effort"
    },
    {
      text: "Focus on being productive instead of busy.",
      author: "Tim Ferriss",
      category: "productivity"
    },
    {
      text: "A goal is a dream with a deadline.",
      author: "Napoleon Hill",
      category: "goals"
    },
    {
      text: "You don't have to be perfect, you just have to be better than you were yesterday.",
      author: "Unknown",
      category: "improvement"
    }
  ];

  useEffect(() => {
    loadQuoteForToday();
  }, []);

  const loadQuoteForToday = () => {
    // Get a consistent quote for today based on the date
    const today = new Date();
    const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000);
    const quoteIndex = dayOfYear % motivationalQuotes.length;
    setCurrentQuote(motivationalQuotes[quoteIndex]);
  };

  const getRandomQuote = () => {
    setLoading(true);
    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * motivationalQuotes.length);
      setCurrentQuote(motivationalQuotes[randomIndex]);
      setLoading(false);
    }, 500); // Small delay for better UX
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      productivity: 'text-blue-400',
      persistence: 'text-green-400',
      innovation: 'text-purple-400',
      passion: 'text-red-400',
      excellence: 'text-yellow-400',
      action: 'text-orange-400',
      resilience: 'text-emerald-400',
      confidence: 'text-pink-400',
      beginning: 'text-indigo-400',
      progress: 'text-teal-400',
      mindset: 'text-cyan-400',
      growth: 'text-lime-400',
      success: 'text-amber-400',
      effort: 'text-rose-400',
      goals: 'text-violet-400',
      improvement: 'text-sky-400'
    };
    return colors[category] || 'text-gray-400';
  };

  if (!currentQuote) {
    return (
      <BaseWidget
        {...props}
        title="Daily Inspiration"
        icon={Quote}
      >
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-500"></div>
        </div>
      </BaseWidget>
    );
  }

  return (
    <BaseWidget
      {...props}
      title="Daily Inspiration"
      icon={Quote}
    >
      <div className="space-y-4">
        <div className="relative">
          <Quote className="absolute -top-1 -left-1 w-6 h-6 text-gray-600 opacity-50" />
          <blockquote className="text-sm text-white leading-relaxed pl-6 pr-2 italic">
            "{currentQuote.text}"
          </blockquote>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-right">
            <div className="text-xs font-medium text-gray-300">
              — {currentQuote.author}
            </div>
            <div className={`text-xs font-medium ${getCategoryColor(currentQuote.category)} mt-1`}>
              #{currentQuote.category}
            </div>
          </div>
          
          <Button
            size="sm"
            variant="ghost"
            onClick={getRandomQuote}
            disabled={loading}
            className="h-8 w-8 p-0 ml-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        <div className="text-center pt-2 border-t border-gray-700">
          <div className="text-xs text-gray-500">
            💪 Stay motivated, keep building!
          </div>
        </div>
      </div>
    </BaseWidget>
  );
};

export default MotivationalQuotesWidget;