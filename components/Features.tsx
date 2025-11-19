import React from 'react';
import { BrainCircuit, Zap, Music2 } from 'lucide-react';
import { motion } from 'framer-motion';

const features = [
  {
    icon: BrainCircuit,
    title: "Mood → Music",
    desc: "Our AI analyzes your emotional state to find the perfect sonic match."
  },
  {
    icon: Music2,
    title: "Instant Curation",
    desc: "Get a 40-song setlist perfectly flow-optimized for your vibe."
  },
  {
    icon: Zap,
    title: "One-Tap Sync",
    desc: "Transfer your new favorite playlist directly to your Spotify library."
  }
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

const Features: React.FC = () => {
  return (
    <section className="py-20 px-6 relative z-10 bg-dark-900">
      <div className="max-w-5xl mx-auto">
        <motion.div 
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {features.map((feature, idx) => (
            <motion.div 
              key={idx}
              variants={item}
              className="p-8 rounded-2xl bg-dark-800 border border-dark-700 hover:border-spotify/50 transition-all duration-300 group hover:bg-dark-700/50"
            >
              <div className="w-12 h-12 rounded-full bg-dark-700 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <feature.icon className="w-6 h-6 text-spotify" />
              </div>
              <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
              <p className="text-gray-400 leading-relaxed">
                {feature.desc}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Features;