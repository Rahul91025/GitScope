import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import { motion } from "framer-motion";

const RepoDetail = () => {
  const { username, reponame } = useParams();
  const [repo, setRepo] = useState(null);
  const [readmeSummary, setReadmeSummary] = useState("");
  const [codeSummary, setCodeSummary] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [readmeLoading, setReadmeLoading] = useState(false);
  const [codeLoading, setCodeLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRepoData = async () => {
      try {
        setProgress(10);
        setError(null);
        
        const repoRes = await axios.get(
          `https://api.github.com/repos/${username}/${reponame}`
        );
        const repoData = repoRes.data;
        setRepo(repoData);
        setProgress(100);
        setTimeout(() => setLoading(false), 500);
      } catch (error) {
        console.error("Error loading repo:", error);
        setError("Failed to load repository data");
        setLoading(false);
      }
    };

    fetchRepoData();
  }, [username, reponame]);

  const fetchReadme = async () => {
    if (readmeSummary || readmeLoading) return;
    
    setReadmeLoading(true);
    try {
      const defaultBranch = repo.default_branch;
      
      // Try different README file names
      const readmeVariants = ['README.md', 'readme.md', 'README.MD', 'README.txt', 'README'];
      let readmeContent = null;
      
      for (const variant of readmeVariants) {
        try {
          const readmeRes = await axios.get(
            `https://raw.githubusercontent.com/${username}/${reponame}/${defaultBranch}/${variant}`
          );
          readmeContent = readmeRes.data;
          break;
        } catch (err) {
          // Continue trying other variants
          continue;
        }
      }
      
      if (readmeContent) {
        // Limit to first 5000 characters to avoid overwhelming the display
        const truncatedContent = readmeContent.length > 5000 
          ? readmeContent.substring(0, 5000) + "\n\n... (Content truncated for display)"
          : readmeContent;
        setReadmeSummary(truncatedContent);
      } else {
        setReadmeSummary("No README file found in this repository.");
      }
    } catch (error) {
      console.error("Error fetching README:", error);
      setReadmeSummary("Failed to load README file.");
    } finally {
      setReadmeLoading(false);
    }
  };

  const fetchCodeAnalysis = async () => {
    if (codeSummary || codeLoading) return;
    
    setCodeLoading(true);
    try {
      const defaultBranch = repo.default_branch;

      // Get repository contents
      const contentsRes = await axios.get(
        `https://api.github.com/repos/${username}/${reponame}/contents?ref=${defaultBranch}`
      );

      const analyzeContents = (contents, path = "") => {
        let fileStats = {
          totalFiles: 0,
          codeFiles: 0,
          directories: 0,
          fileTypes: {},
          structure: []
        };

        contents.forEach(item => {
          if (item.type === "file") {
            fileStats.totalFiles++;
            
            const ext = item.name.split('.').pop()?.toLowerCase();
            if (ext) {
              fileStats.fileTypes[ext] = (fileStats.fileTypes[ext] || 0) + 1;
            }

            // Check if it's a code file
            const codeExtensions = ['js', 'jsx', 'ts', 'tsx', 'py', 'java', 'cpp', 'c', 'h', 'css', 'html', 'php', 'rb', 'go', 'rs', 'swift', 'kt'];
            if (codeExtensions.includes(ext)) {
              fileStats.codeFiles++;
              const purposeGuess = getPurposeGuess(item.name, ext);
              fileStats.structure.push(`📄 \`${path}${item.name}\` - ${purposeGuess}`);
            } else {
              fileStats.structure.push(`📄 \`${path}${item.name}\``);
            }
          } else if (item.type === "dir") {
            fileStats.directories++;
            fileStats.structure.push(`📁 \`${path}${item.name}/\``);
          }
        });

        return fileStats;
      };

      const getPurposeGuess = (filename, ext) => {
        const name = filename.toLowerCase();
        
        if (name.includes('test') || name.includes('spec')) return "🧪 Test File";
        if (name.includes('config') || name.includes('setup')) return "⚙️ Configuration";
        if (name.includes('component') || ext === 'jsx' || ext === 'tsx') return "⚛️ React Component";
        if (name.includes('api') || name.includes('service')) return "🛠️ API/Service";
        if (name.includes('util') || name.includes('helper')) return "🔧 Utility";
        if (name.includes('style') || ext === 'css' || ext === 'scss') return "🎨 Styling";
        if (name === 'index.js' || name === 'index.ts') return "🏠 Entry Point";
        if (ext === 'md') return "📚 Documentation";
        if (ext === 'json') return "📊 Data/Config";
        
        switch (ext) {
          case 'js': case 'ts': return "📝 JavaScript/TypeScript";
          case 'py': return "🐍 Python Script";
          case 'java': return "☕ Java Class";
          case 'cpp': case 'c': return "⚡ C/C++ Source";
          case 'html': return "🌐 HTML Page";
          default: return "📄 Source File";
        }
      };

      const stats = analyzeContents(contentsRes.data);
      
      // Generate summary
      const topFileTypes = Object.entries(stats.fileTypes)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([ext, count]) => `${ext}: ${count}`)
        .join(', ');

      const summary = [
        `### 🗂️ Repository Structure`,
        ``,
        `**📊 Quick Stats:**`,
        `- 📁 Total Files: **${stats.totalFiles}**`,
        `- 💻 Code Files: **${stats.codeFiles}**`,
        `- 📂 Directories: **${stats.directories}**`,
        `- 🏷️ Top File Types: ${topFileTypes || 'N/A'}`,
        ``,
        `**📋 File Structure:**`,
        stats.structure.slice(0, 50).join('\n'), // Limit to first 50 items
        stats.structure.length > 50 ? '\n... (More files not shown for brevity)' : '',
        ``,
        `---`,
        `*Analysis based on repository root directory. For detailed code analysis, clone the repository locally.*`
      ].join('\n');

      setCodeSummary(summary);
    } catch (error) {
      console.error("Error fetching code analysis:", error);
      setCodeSummary("Failed to analyze repository code structure. This might be due to API rate limits or repository access restrictions.");
    } finally {
      setCodeLoading(false);
    }
  };

  // Trigger data fetching when tabs are switched
  useEffect(() => {
    if (!repo) return;
    
    if (activeTab === 'readme' && !readmeSummary) {
      fetchReadme();
    } else if (activeTab === 'code' && !codeSummary) {
      fetchCodeAnalysis();
    }
  }, [activeTab, repo]);

  const formatNumber = (num) => {
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k`;
    }
    return num?.toString() || '0';
  };

  const getLanguageColor = (language) => {
    const colors = {
      JavaScript: '#f1e05a',
      TypeScript: '#2b7489',
      Python: '#3572A5',
      Java: '#b07219',
      'C++': '#f34b7d',
      C: '#555555',
      Go: '#00ADD8',
      Rust: '#dea584',
      Swift: '#ffac45',
      Kotlin: '#F18E33',
    };
    return colors[language] || '#8b949e';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-32 h-32 mx-auto mb-8">
            <div className="absolute inset-0 rounded-full border-4 border-gray-800"></div>
            <div 
              className="absolute inset-0 rounded-full border-4 border-t-cyan-500 border-r-purple-500 animate-spin"
              style={{ borderLeftColor: 'transparent', borderBottomColor: 'transparent' }}
            ></div>
            <div className="absolute inset-4 rounded-full bg-gray-900/50 backdrop-blur-sm flex items-center justify-center">
              <span className="text-cyan-400 font-mono text-lg">{progress}%</span>
            </div>
          </div>
          <h2 className="text-xl font-semibold text-gray-200 mb-2">Loading Repository</h2>
          <p className="text-gray-400">Fetching repository details...</p>
          <div className="w-64 h-2 bg-gray-800 rounded-full mx-auto mt-4 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      </div>
    );
  }

  if (!repo || error) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-500/20 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-200 mb-2">Repository Not Found</h2>
          <p className="text-gray-400">{error || "The repository could not be loaded."}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 p-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-6xl mx-auto"
      >
        {/* Header Section */}
        <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800/50 p-8 mb-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-cyan-200 to-purple-300 bg-clip-text text-transparent">
                  {repo.name}
                </h1>
                <div className="px-3 py-1 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 rounded-full border border-cyan-500/20">
                  <span className="text-xs font-medium text-cyan-300">PUBLIC</span>
                </div>
              </div>
              <p className="text-gray-300 text-lg mb-4">
                {repo.description || "No description provided."}
              </p>
              <div className="flex items-center gap-4 text-sm">
                <span className="text-gray-400">by</span>
                <div className="flex items-center gap-2">
                  <img 
                    src={repo.owner.avatar_url} 
                    alt={repo.owner.login}
                    className="w-6 h-6 rounded-full border border-gray-700"
                  />
                  <span className="text-cyan-300 font-medium">{repo.owner.login}</span>
                </div>
                <span className="text-gray-500">•</span>
                <span className="text-gray-400">Updated {new Date(repo.updated_at).toLocaleDateString()}</span>
              </div>
            </div>
            <a
              href={repo.html_url}
              target="_blank"
              rel="noreferrer"
              className="bg-gradient-to-r from-cyan-500 to-purple-500 px-6 py-3 rounded-lg text-white font-medium hover:shadow-lg hover:shadow-cyan-500/20 transition-all duration-300"
            >
              View on GitHub
            </a>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-800/30 backdrop-blur-sm rounded-lg p-4 border border-gray-700/50">
              <div className="flex items-center gap-2 mb-1">
                <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.956a1 1 0 00.95.69h4.161c.969 0 1.371 1.24.588 1.81l-3.364 2.445a1 1 0 00-.364 1.118l1.286 3.956c.3.921-.755 1.688-1.539 1.118l-3.364-2.445a1 1 0 00-1.176 0l-3.364 2.445c-.784.57-1.838-.197-1.539-1.118l1.286-3.956a1 1 0 00-.364-1.118L2.053 9.383c-.784-.57-.38-1.81.588-1.81h4.161a1 1 0 00.95-.69l1.286-3.956z" />
                </svg>
                <span className="text-gray-400 text-sm">Stars</span>
              </div>
              <span className="text-xl font-bold text-white">{formatNumber(repo.stargazers_count)}</span>
            </div>
            
            <div className="bg-gray-800/30 backdrop-blur-sm rounded-lg p-4 border border-gray-700/50">
              <div className="flex items-center gap-2 mb-1">
                <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 16 16">
                  <path fillRule="evenodd" d="M5 3.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm0 2.122a2.25 2.25 0 10-1.5 0v.878A2.25 2.25 0 005.75 8.5h1.5v2.128a2.25 2.25 0 101.5 0V8.5h1.5a2.25 2.25 0 002.25-2.25v-.878a2.25 2.25 0 10-1.5 0v.878a.75.75 0 01-.75.75H9.25V4.372a2.25 2.25 0 10-1.5 0v1.878H6.25a.75.75 0 01-.75-.75V5.372A2.25 2.25 0 105 5.372v-.75z"></path>
                </svg>
                <span className="text-gray-400 text-sm">Forks</span>
              </div>
              <span className="text-xl font-bold text-white">{formatNumber(repo.forks_count)}</span>
            </div>

            <div className="bg-gray-800/30 backdrop-blur-sm rounded-lg p-4 border border-gray-700/50">
              <div className="flex items-center gap-2 mb-1">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: getLanguageColor(repo.language) }}
                ></div>
                <span className="text-gray-400 text-sm">Language</span>
              </div>
              <span className="text-xl font-bold text-white">{repo.language || 'N/A'}</span>
            </div>

            <div className="bg-gray-800/30 backdrop-blur-sm rounded-lg p-4 border border-gray-700/50">
              <div className="flex items-center gap-2 mb-1">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <span className="text-gray-400 text-sm">Watchers</span>
              </div>
              <span className="text-xl font-bold text-white">{formatNumber(repo.watchers_count)}</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-gray-900/50 backdrop-blur-sm rounded-lg border border-gray-800/50 p-1 mb-6">
          {[
            { id: 'overview', label: 'Overview', icon: '📊' },
            { id: 'readme', label: 'README', icon: '📄' },
            { id: 'code', label: 'Code Analysis', icon: '🧠' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-md font-medium transition-all duration-300 ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-cyan-300 border border-cyan-500/30'
                  : 'text-gray-400 hover:text-gray-300 hover:bg-gray-800/50'
              }`}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800/50 p-8"
        >
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white mb-4">Repository Overview</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-cyan-300">Details</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Created:</span>
                      <span className="text-gray-300">{new Date(repo.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Size:</span>
                      <span className="text-gray-300">{(repo.size / 1024).toFixed(1)} MB</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Default Branch:</span>
                      <span className="text-gray-300">{repo.default_branch}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">License:</span>
                      <span className="text-gray-300">{repo.license?.name || 'None'}</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-cyan-300">Topics</h3>
                  <div className="flex flex-wrap gap-2">
                    {repo.topics?.length > 0 ? (
                      repo.topics.map((topic, index) => (
                        <span 
                          key={index}
                          className="px-3 py-1 bg-gray-800/50 text-gray-300 rounded-full text-xs border border-gray-700/50"
                        >
                          {topic}
                        </span>
                      ))
                    ) : (
                      <span className="text-gray-400 text-sm">No topics available</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}



{activeTab === 'readme' && (
  <div>
    <h2 className="text-2xl font-bold text-white mb-6">README</h2>
    {readmeLoading ? (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-3 text-cyan-400">
          <div className="w-5 h-5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
          <span>Loading README...</span>
        </div>
      </div>
    ) : (
      <div className="prose prose-invert max-w-none bg-gray-800/30 rounded-lg p-6 border border-gray-700/50">
        <ReactMarkdown
          components={{
            p: ({ node, ...props }) => (
              <p {...props} className="text-gray-300" />
            ),
            h1: ({ node, ...props }) => (
              <h1 {...props} className="text-white text-3xl font-bold" />
            ),
            h2: ({ node, ...props }) => (
              <h2 {...props} className="text-white text-2xl font-semibold mt-4" />
            ),
            li: ({ node, ...props }) => (
              <li {...props} className="text-gray-300 list-disc ml-6" />
            ),
            code: ({ node, inline, className, children, ...props }) => (
              <code {...props} className="bg-gray-700 px-1 py-0.5 rounded text-pink-400" >
                {children}
              </code>
            ),
            pre: ({ node, ...props }) => (
              <pre {...props} className="bg-black text-gray-100 p-4 rounded-md overflow-x-auto" />
            ),
          }}
        >
          {readmeSummary || "README content will appear here..."}
        </ReactMarkdown>
      </div>
    )}
  </div>
)}


{activeTab === 'code' && (
  <div>
    <h2 className="text-2xl font-bold text-white mb-6">Code Analysis</h2>
    {codeLoading ? (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-3 text-cyan-400">
          <div className="w-5 h-5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
          <span>Analyzing code structure...</span>
        </div>
      </div>
    ) : codeSummary ? (
      <div className="prose prose-invert max-w-none bg-gray-800/30 rounded-lg p-6 border border-gray-700/50">
        <ReactMarkdown
          components={{
            p: ({ node, ...props }) => (
              <p {...props} className="text-gray-300 whitespace-pre-wrap" />
            ),
            code: ({ node, inline, className, children, ...props }) => (
              <code {...props} className="bg-gray-700 px-1 py-0.5 rounded text-green-400 whitespace-pre-wrap">
                {children}
              </code>
            ),
            pre: ({ node, ...props }) => (
              <pre {...props} className="bg-black text-gray-100 p-4 rounded-md overflow-x-auto" />
            ),
          }}
        >
          {codeSummary}
        </ReactMarkdown>
      </div>
    ) : (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 bg-gray-800/50 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <p className="text-gray-400">Code analysis will appear here...</p>
      </div>
    )}
  </div>
)}
        </motion.div>

        {/* Back Navigation */}
        <div className="mt-8 flex justify-between items-center">
          <Link
            to={`/summary/${username}`}
            className="group flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors duration-200"
          >
            <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to {username}'s Profile
          </Link>
          
          <div className="flex gap-3">
            <a
              href={`${repo.html_url}/issues`}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 bg-gray-800/50 text-gray-300 rounded-lg hover:bg-gray-700/50 transition-colors duration-200 text-sm"
            >
              Issues ({repo.open_issues_count})
            </a>
            <a
              href={`${repo.html_url}/network/members`}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 bg-gray-800/50 text-gray-300 rounded-lg hover:bg-gray-700/50 transition-colors duration-200 text-sm"
            >
              Network
            </a>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default RepoDetail;