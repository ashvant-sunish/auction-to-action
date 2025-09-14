import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { socketServerUrl } from '../../servercon';
import socketService from '../../services/socket';

const TradingMarket = () => {
  const [teams, setTeams] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [visibleDetails, setVisibleDetails] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get current user's team code to exclude from the list
  const getCurrentTeamCode = () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.teamCode;
      }
    } catch (err) {
      console.error('Error getting team code:', err);
    }
    return null;
  };

  const fetchTeamsData = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('=== FETCHING TEAMS DATA FOR TRADING MARKET ===');

      // Fetch all teams with their trade wishlists
      const response = await axios.get(`${socketServerUrl}/api/team/all-trade-offers`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      console.log('TradingMarket response:', response.data);

      if (response.data.success) {
        const currentTeamCode = getCurrentTeamCode();
        console.log('Current team code:', currentTeamCode);
        // Filter out current team from the list
        const otherTeams = response.data.teams.filter(team => 
          team.teamCode !== currentTeamCode
        );
        console.log('Other teams after filtering:', otherTeams.length);
        console.log('Teams with wishlists:', otherTeams.map(t => ({
          teamCode: t.teamCode,
          wishlistCount: t.tradeWishlist?.length || 0
        })));
        setTeams(otherTeams);
      } else {
        setError('Failed to fetch teams data');
      }
    } catch (err) {
      console.error('Error fetching teams data:', err);
      setError('Failed to load trading offers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeamsData();

    // Listen for real-time trade wishlist updates
    const handleWishlistUpdate = (data) => {
      console.log('Trade wishlist updated:', data);
      // Refresh teams data when someone submits/updates their wishlist
      fetchTeamsData();
    };

    if (socketService.getSocket()) {
      socketService.getSocket().on('tradeWishlistSubmitted', handleWishlistUpdate);
    }

    return () => {
      if (socketService.getSocket()) {
        socketService.getSocket().off('tradeWishlistSubmitted', handleWishlistUpdate);
      }
    };
  }, []);

  const filteredTeams = teams.filter(team => {
    // Only show teams that have submitted trade wishlists
    if (!team.tradeWishlist || team.tradeWishlist.length === 0) {
      return false;
    }

    // Filter by search query in trade wishlist items only
    if (searchQuery === '') {
      return true;
    }

    const searchLower = searchQuery.toLowerCase();
    return team.tradeWishlist.some(item =>
      item.name.toLowerCase().includes(searchLower)
    );
  });

  const toggleDetails = (teamId) => {
    setVisibleDetails(prev => {
      const newSet = new Set(prev);
      if (newSet.has(teamId)) {
        newSet.delete(teamId);
      } else {
        newSet.add(teamId);
      }
      return newSet;
    });
  };

  if (loading) {
    return (
      <div className="main-container">
        <div className="content-container">
          <h1 className="title">Trading Offers</h1>
          <div style={{ textAlign: 'center', padding: '2rem', color: '#031716' }}>
            <div style={{ 
              border: '4px solid #0A7075', 
              borderRadius: '50%', 
              borderTopColor: 'transparent',
              width: '50px', 
              height: '50px', 
              animation: 'spin 1s linear infinite',
              margin: '0 auto 1rem'
            }}></div>
            <p>Loading trading offers...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="main-container">
        <div className="content-container">
          <h1 className="title">Trading Offers</h1>
          <div style={{ 
            backgroundColor: '#ffebee', 
            color: '#c62828', 
            padding: '1rem', 
            borderRadius: '0.5rem',
            textAlign: 'center'
          }}>
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>
        {`
          body {
            font-family: sans-serif;
          }
          .main-container {
            min-height: 100vh;
            background-color: #FFFFFF;
            padding: 2rem;
            display: flex;
            flex-direction: column;
            align-items: center;
          }
          .content-container {
            max-width: 72rem;
            width: 100%;
          }
          .title {
            font-size: 2.25rem;
            font-weight: 700;
            text-align: center;
            color: #031716;
            margin-bottom: 2rem;
          }
          .search-bar {
            margin-bottom: 2rem;
            width: 100%;
            position: relative;
            display: flex;
            align-items: center;
            background-color: #F5F5F5;
            border-radius: 1rem;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          }
          .search-icon {
            position: absolute;
            left: 1rem;
            color: #0A7075;
          }
          .search-input {
            width: 100%;
            padding: 0.75rem 1rem 0.75rem 3rem;
            border-radius: 1rem;
            border: none;
            background-color: transparent;
            color: #031716;
          }
          .search-input:focus {
            outline: none;
          }
          .search-input::placeholder {
            color: #6BA3BE;
          }
          .teams-grid {
            display: grid;
            gap: 1.5rem;
            grid-template-columns: repeat(1, 1fr);
          }
          @media (min-width: 768px) {
            .teams-grid {
              grid-template-columns: repeat(2, 1fr);
            }
          }
          @media (min-width: 1024px) {
            .teams-grid {
              grid-template-columns: repeat(3, 1fr);
            }
          }
          .team-card {
            background-color: #031716;
            color: #FFFFFF;
            border-radius: 1rem;
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
            padding: 1.5rem;
            transition: box-shadow 0.2s ease-in-out;
            border: 2px solid #0A7075;
          }
          .team-card:hover {
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
          }
          .team-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1rem;
          }
          .team-name {
            font-size: 1.5rem;
            font-weight: 600;
            color: #FFFFFF;
          }
          .toggle-button {
            padding: 0.5rem;
            border-radius: 9999px;
            background-color: #0C969C;
            color: #FFFFFF;
            transition: background-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
            border: none;
            cursor: pointer;
          }
          .toggle-button:hover {
            background-color: #0A7075;
          }
          .icon-svg {
            height: 1.5rem;
            width: 1.5rem;
          }
          .details-section {
            margin-top: 1rem;
            padding-top: 1rem;
            border-top: 1px solid #0A7075;
          }
          .wishlist-heading {
            font-weight: 600;
            color: #0C969C;
            margin-bottom: 0.5rem;
            margin-top: 1rem;
          }
          .materials-list {
            list-style-type: disc;
            list-style-position: inside;
            padding-left: 0;
            margin-top: 0.25rem;
            margin-bottom: 0.25rem;
          }
          .material-item {
            color: #6BA3BE;
            line-height: 1.5;
          }
          .wishlist-item {
            color: #0C969C;
            line-height: 1.5;
            font-weight: 500;
          }
          .material-quantity {
            font-weight: 500;
            color: #FFFFFF;
          }
          .no-teams-message {
            text-align: center;
            color: #031716;
            grid-column: 1 / -1;
          }
          .no-wishlist {
            color: #6BA3BE;
            font-style: italic;
          }
          @keyframes slide-down {
            0% {
              transform: translateY(-10px);
              opacity: 0;
            }
            100% {
              transform: translateY(0);
              opacity: 1;
            }
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          .animate-slide-down {
            animation: slide-down 0.3s ease-out forwards;
          }
        `}
      </style>
      <div className="main-container">
        <div className="content-container">
          <h1 className="title">Trading Offers</h1>

          <div className="search-bar">
            <svg className="search-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="24" height="24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search for items teams want to trade (e.g., 'Property')"
              className="search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="teams-grid">
            {filteredTeams.length > 0 ? (
              filteredTeams.map(team => (
                <div key={team._id} className="team-card">
                  <div className="team-header">
                    <div>
                      <h2 className="team-name">{team.teamName}</h2>
                    </div>
                    <button
                      onClick={() => toggleDetails(team._id)}
                      className="toggle-button"
                      aria-expanded={visibleDetails.has(team._id)}
                    >
                      {visibleDetails.has(team._id) ? (
                        <svg className="icon-svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                        </svg>
                      ) : (
                        <svg className="icon-svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                      )}
                    </button>
                  </div>
                  
                  {visibleDetails.has(team._id) && (
                    <div className="details-section animate-slide-down">
                      <p className="wishlist-heading">Items They Want to Trade:</p>
                      <ul className="materials-list">
                        {team.tradeWishlist && team.tradeWishlist.length > 0 ? 
                          team.tradeWishlist.map((item, index) => (
                            <li key={index} className="wishlist-item">
                              <span className="material-quantity">{item.count}x</span> {item.name}
                            </li>
                          )) : (
                            <li className="no-wishlist">No trade wishlist submitted yet</li>
                          )
                        }
                      </ul>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p className="no-teams-message">No teams found matching your search.</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default TradingMarket;