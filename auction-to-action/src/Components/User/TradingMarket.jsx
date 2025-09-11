import React, { useState, useEffect } from 'react';

const TradingMarket = () => {
  const [teams, setTeams] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [visibleDetails, setVisibleDetails] = useState(new Set());

  const generateTeamData = () => {
    const products = ['Skilled Labour', 'Machinery', 'Land', 'Raw Materials', 'Finished Goods', 'Transport', 'Capital'];
    const newTeams = [];
    for (let i = 1; i <= 50; i++) {
      const teamProducts = [];
      const numProducts = Math.floor(Math.random() * 5) + 2;
      for (let j = 0; j < numProducts; j++) {
        const randomProduct = products[Math.floor(Math.random() * products.length)];
        const quantity = Math.floor(Math.random() * 10) + 1;
        teamProducts.push({ name: randomProduct, quantity });
      }
      newTeams.push({
        id: i,
        name: `Team ${i}`,
        materials: teamProducts,
      });
    }
    return newTeams;
  };

  useEffect(() => {
    setTeams(generateTeamData());
  }, []);

  const filteredTeams = teams.filter(team =>
    team.materials.some(material =>
      material.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

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
            padding: 0.75rem 1rem 0.75rem 3rem; /* Adjusted padding for icon */
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
          .details-heading {
            font-weight: 600;
            color: #6BA3BE;
            margin-bottom: 0.5rem;
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
          .material-quantity {
            font-weight: 500;
            color: #FFFFFF;
          }
          .no-teams-message {
            text-align: center;
            color: #031716;
            grid-column: 1 / -1;
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
              placeholder="Search for a product (e.g., 'Machinery')"
              className="search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="teams-grid">
            {filteredTeams.length > 0 ? (
              filteredTeams.map(team => (
                <div key={team.id} className="team-card">
                  <div className="team-header">
                    <h2 className="team-name">{team.name}</h2>
                    <button
                      onClick={() => toggleDetails(team.id)}
                      className="toggle-button"
                      aria-expanded={visibleDetails.has(team.id)}
                    >
                      {visibleDetails.has(team.id) ? (
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
                  
                  {visibleDetails.has(team.id) && (
                    <div className="details-section animate-slide-down">
                      <p className="details-heading">Materials Owned:</p>
                      <ul className="materials-list">
                        {team.materials.map((material, index) => (
                          <li key={index} className="material-item">
                            <span className="material-quantity">{material.quantity}x</span> {material.name}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p className="no-teams-message">No teams found with that material.</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default TradingMarket;
