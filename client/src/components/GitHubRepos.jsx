import { useState, useEffect } from 'react';
import axios from 'axios';
import './GitHubRepos.css';

const GITHUB_USERS = [
  { username: 'Ashvi2006', label: 'Ashvi2006 (My Profile)' }
];

function GitHubRepos() {
  const [repos, setRepos] = useState([]);
  const [filteredRepos, setFilteredRepos] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState(GITHUB_USERS[0].username);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchRepos = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`https://api.github.com/users/${selectedUser}/repos?sort=updated&per_page=30`);
      setRepos(res.data);
      setFilteredRepos(res.data);
    } catch (err) {
      setError(err.response?.data?.message || `Failed to fetch repositories: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRepos();
  }, [selectedUser]);

  useEffect(() => {
    if (search.trim() === '') {
      setFilteredRepos(repos);
    } else {
      setFilteredRepos(repos.filter(repo =>
        repo.name.toLowerCase().includes(search.toLowerCase())
      ));
    }
  }, [search, repos]);

  const languageColors = {
    JavaScript: '#f1e05a',
    TypeScript: '#3178c6',
    Python: '#3572A5',
    HTML: '#e34c26',
    CSS: '#563d7c',
    Java: '#b07219',
    'Jupyter Notebook': '#DA5B0B',
    default: '#6366f1'
  };

  return (
    <section className="github-section card">
      <div className="github-header">
        <div>
          <h2 className="section-title">🌐 GitHub Repositories (REST API Integration)</h2>
          <p className="github-subtitle">Practical 3: Async useEffect fetching, loading spinner & error handling</p>
        </div>
        <div className="github-controls">
          <span className="github-user-label">GitHub User:</span>
          <div className="github-user-select-wrapper">
            <select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="input github-user-select"
            >
              {GITHUB_USERS.map(u => (
                <option key={u.username} value={u.username}>{u.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="github-search-row">
        <div className="search-input-wrapper">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search repositories by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input search-input"
          />
        </div>
        <button className="btn btn-refresh" onClick={fetchRepos} disabled={loading}>
          🔄 Refresh API Data
        </button>
      </div>

      {loading && (
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Fetching repositories...</p>
        </div>
      )}

      {error && (
        <div className="error-card">
          <div className="error-content">
            <div>
              <strong>⚠️ API Error</strong>
              <p>{error}</p>
            </div>
            <button className="btn btn-retry" onClick={fetchRepos}>🔁 Retry</button>
          </div>
        </div>
      )}

      {!loading && !error && (
        <div className="repo-grid">
          {filteredRepos.map(repo => (
            <div key={repo.id} className="repo-card">
              <div className="repo-card-header">
                <h3 className="repo-name">{repo.name}</h3>
                <span className="repo-stars">⭐ {repo.stargazers_count}</span>
              </div>
              <p className="repo-description">
                {repo.description || 'No description provided.'}
              </p>
              <div className="repo-footer">
                <span className="repo-language" style={{
                  color: languageColors[repo.language] || languageColors.default
                }}>
                  {repo.language || 'Unknown'}
                </span>
                <a
                  href={repo.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="repo-link"
                >
                  View Code ↗
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && !error && filteredRepos.length === 0 && (
        <p className="no-repos">No repositories found matching "{search}"</p>
      )}
    </section>
  );
}

export default GitHubRepos;
