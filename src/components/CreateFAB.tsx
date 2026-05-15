"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, MessageSquare, Users, FileText, Video, BookOpen, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

export const CreateFAB = () => {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const options = [
    { icon: MessageSquare, label: 'New Chat', action: () => { router.push('/chat?new=true'); setIsOpen(false); }, color: 'bg-blue-500' },
    { icon: Users, label: 'Create Group', action: () => { router.push('/chat?group=true'); setIsOpen(false); }, color: 'bg-emerald-500' },
    { icon: FileText, label: 'Create Blog', action: () => { router.push('/blog/create'); setIsOpen(false); }, color: 'bg-amber-500' },
    { icon: Video, label: 'Upload Shorts', action: () => { router.push('/shorts/upload'); setIsOpen(false); }, color: 'bg-rose-500' },
    { icon: BookOpen, label: 'Create Course', action: () => { router.push('/course/create'); setIsOpen(false); }, color: 'bg-purple-500' },
  ];

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4 sm:p-0"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 50 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card w-full max-w-sm rounded-3xl p-6 shadow-2xl border border-border relative mb-20 sm:mb-0"
            >
              <button onClick={() => setIsOpen(false)} className="absolute top-4 right-4 p-2 bg-secondary rounded-full hover:bg-secondary/80 transition-colors">
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
              
              <h2 className="text-xl font-bold mb-6">Create New</h2>
              
              <div className="grid grid-cols-2 gap-4">
                {options.map((opt, i) => (
                  <button
                    key={i}
                    onClick={opt.action}
                    className="flex flex-col items-center justify-center gap-3 p-4 bg-secondary/50 rounded-2xl hover:bg-secondary transition-colors active:scale-95 group"
                  >
                    <div className={`w-12 h-12 rounded-full ${opt.color} flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform`}>
                      <opt.icon className="w-6 h-6" />
                    </div>
                    <span className="text-sm font-medium">{opt.label}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 md:bottom-8 right-4 md:right-8 w-14 h-14 bg-primary text-primary-foreground rounded-full shadow-xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all z-40 hover:shadow-primary/30"
      >
        <Plus className="w-6 h-6" />
      </button>
    </>
  );
};
