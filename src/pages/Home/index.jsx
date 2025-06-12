import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FaGithub, FaMoon, FaSun } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const [darkMode, setDarkMode] = useState(true);
  const [githubUrl, setGithubUrl] = useState("");
  const navigate = useNavigate();

  const toggleDarkMode = () => setDarkMode((prev) => !prev);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  const handleGenerate = () => {
    const match = githubUrl.match(/github\.com\/([\w-]+)/);
    const username = match?.[1];
    if (username) {
      navigate(`/summary/${username}`);
    } else {
      alert("Please enter a valid GitHub profile URL.");
    }
  };

  // Framer Motion Variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 1, ease: "easeOut" } },
  };

  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 1.5, ease: "easeInOut" } },
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={fadeIn}
      className="relative min-h-screen bg-cover bg-center flex flex-col justify-start px-4 py-12 overflow-y-auto"
      style={{ backgroundImage: "url('./images/bg1.jpg')" }}
    >
      {/* Background Overlay */}
      <div className="absolute inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm z-0"></div>

      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1, ease: "easeOut", delay: 0.5 }}
        className="absolute top-[-2rem] left-[-3rem] z-50"
      >
        <img
          src="./images/logo.png"
          alt="Logo"
          className="h-[10rem] w-[20rem] object-contain drop-shadow-lg"
        />
      </motion.div>

      {/* Light/Dark Toggle */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: "easeInOut", delay: 0.8 }}
        className="absolute top-4 right-4 z-50 flex items-center gap-3"
      >
        <FaSun className="text-white dark:text-gray-400" />
        <div
          onClick={toggleDarkMode}
          className="w-14 h-8 flex items-center bg-gray-300 dark:bg-gray-600 rounded-full px-1 cursor-pointer"
        >
          <motion.div
            className="w-6 h-6 bg-white dark:bg-gray-900 rounded-full shadow-md"
            layout
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
            style={{ x: darkMode ? 28 : 0 }}
          />
        </div>
        <FaMoon className="text-white dark:text-gray-400" />
      </motion.div>

      {/* Main Content */}
      <motion.div
        variants={fadeInUp}
        className="relative mt-[7rem] z-10 flex flex-col items-center text-center max-w-3xl px-6 text-white dark:text-gray-100 mx-auto"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1, delay: 0.6 }}
        >
          <FaGithub className="text-7xl mb-6" />
        </motion.div>

        <motion.h1
          className="text-5xl font-extrabold mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.7 }}
        >
          GitHub Summary Generator
        </motion.h1>

        <motion.p
          className="text-gray-300 max-w-xl mb-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, delay: 0.8 }}
        >
          Paste your GitHub profile URL and get a beautiful, structured summary of
          your contributions, repositories, and more.
        </motion.p>

        <motion.input
          type="text"
          placeholder="https://github.com/yourusername"
          value={githubUrl}
          onChange={(e) => setGithubUrl(e.target.value)}
          className="w-full px-6 py-3 bg-gray-700 dark:bg-gray-800 shadow-lg text-white rounded-md focus:outline-none"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1 }}
        />

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleGenerate}
          className="mt-5 w-full bg-green-500 text-white font-semibold px-6 py-3 rounded-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1.1 }}
        >
          Generate Summary
        </motion.button>
      </motion.div>

      {/* Features Section */}
      <motion.div
        className="relative z-10 mt-20 max-w-6xl w-full px-4 mx-auto"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={fadeInUp}
      >
        <h2 className="text-3xl font-bold text-white dark:text-gray-100 text-center mb-10">
          Why Use GitHub Summary?
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              title: "📊 Repository Analysis",
              desc: "Gain detailed insights into your repositories, including stars, forks, and top languages.",
            },
            {
              title: "⏱️ Contribution Timeline",
              desc: "Visualize your GitHub activity and understand your development patterns.",
            },
            {
              title: "🧑‍💼 Professional Reports",
              desc: "Perfect summary for your portfolio, job applications, and tech presentations.",
            },
          ].map((feature, idx) => (
            <motion.div
              key={idx}
              className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6 text-white dark:text-gray-100 shadow-lg hover:shadow-cyan-500/20 transition duration-300"
              whileHover={{ y: -5 }}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.3 + idx * 0.2, duration: 0.8 }}
            >
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm text-gray-300">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Home;
