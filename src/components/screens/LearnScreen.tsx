import React, { useState } from 'react';
import { LESSONS_DATA } from '../../data/lessonsData';
import { Lesson } from '../../types/chess';
import { InteractiveLessonView } from './InteractiveLessonView';
import { BookOpen, Award, Zap, CheckCircle2, ChevronRight, Target } from 'lucide-react';

interface LearnScreenProps {
  completedLessonIds: string[];
  onCompleteLesson: (lessonId: string) => void;
}

export const LearnScreen: React.FC<LearnScreenProps> = ({
  completedLessonIds,
  onCompleteLesson,
}) => {
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'beginner' | 'intermediate' | 'advanced'>('all');

  if (selectedLesson) {
    return (
      <InteractiveLessonView
        lesson={selectedLesson}
        onBack={() => setSelectedLesson(null)}
        onCompleteLesson={onCompleteLesson}
      />
    );
  }

  const filteredLessons = LESSONS_DATA.filter((l) => activeTab === 'all' || l.category === activeTab);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white flex items-center gap-2">
            <BookOpen className="w-8 h-8 text-indigo-400" /> Interactive <span className="gradient-text">Learning Center</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Master tactical patterns, endgame techniques, and positional play through interactive lessons.
          </p>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        {[
          { id: 'all', label: 'All Courses' },
          { id: 'beginner', label: 'Beginner' },
          { id: 'intermediate', label: 'Intermediate' },
          { id: 'advanced', label: 'Advanced' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === tab.id
                ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Lesson Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredLessons.map((lesson) => {
          const isDone = completedLessonIds.includes(lesson.id);
          return (
            <div
              key={lesson.id}
              onClick={() => setSelectedLesson(lesson)}
              className="glass-card p-6 rounded-2xl cursor-pointer border border-slate-800 hover:border-indigo-500/60 transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-[10px] uppercase font-bold tracking-wider">
                    {lesson.category}
                  </span>
                  {isDone && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
                </div>

                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-indigo-400 transition-colors">
                  {lesson.title}
                </h3>
                <p className="text-slate-400 text-xs leading-relaxed mb-4">{lesson.description}</p>
              </div>

              <div className="flex items-center justify-between border-t border-slate-800/80 pt-4 text-xs">
                <span className="text-slate-500">{lesson.estimatedMinutes} mins • {lesson.steps.length} steps</span>
                <span className="font-semibold text-indigo-400 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                  Start Lesson <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
