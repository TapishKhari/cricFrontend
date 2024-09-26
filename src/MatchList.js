import React, { useEffect, useState } from 'react';
import axios from 'axios';
import io from 'socket.io-client';

const socket = io('http://localhost:3000');  // Establish a WebSocket connection to the backend

const MatchList = () => {
  const [matches, setMatches] = useState([]);  // State to store the list of matches
  const [newScore, setNewScore] = useState(''); // State to store the new score
  const [selectedMatchId, setSelectedMatchId] = useState(null); // State to track which match is being updated

  useEffect(() => {
    // Fetch the initial list of matches from the backend
    axios.get('http://localhost:3000/matches')
      .then((response) => setMatches(response.data));

    // Listen for 'scoreUpdate' events from the server
    socket.on('scoreUpdate', (update) => {
      setMatches((prevMatches) =>
        prevMatches.map((match) =>
          match._id === update._id ? { ...match, ...update } : match
        )
      );
    });

    return () => {
      socket.off('scoreUpdate'); // Cleanup the socket listener when the component unmounts
    };
  }, []);

  // Function to handle score submission
  const handleScoreSubmit = (e) => {
    e.preventDefault(); // Prevent default form submission behavior

    // Emit the 'updateScore' event to the backend with the new score and match ID
    socket.emit('updateScore', { id: selectedMatchId, score: newScore });
    
    // Reset the score input and selected match ID
    setNewScore('');
    setSelectedMatchId(null);
  };

  return (
    <div>
      <h2>Match List</h2>
      <ul>
        {matches.map((match) => (
          <li key={match._id}>
            {match.team1} vs {match.team2} - {match.status} - {match.score}
            <button onClick={() => {
                console.log('Selected Match ID:', match._id); // Log the selected match ID
              setSelectedMatchId(match._id);
            //   setNewScore(''); // Reset newScore when selecting a match
            }}>
              Update Score
            </button>
          </li>
        ))}
      </ul>

      {
        <form style={{ display: 'block', border: '1px solid red', padding: '10px' }} onSubmit={handleScoreSubmit}>
         {console.log('Form is rendered for match:', selectedMatchId)} {/* Log to check if the form renders */}
          <input 
            type="text" 
            value={newScore} 
            onChange={(e) => setNewScore(e.target.value)} 
            placeholder="Enter new score" 
            required 
          />
          <button type="submit">Submit Score</button>
        </form>
      }
    </div>
  );
};

export default MatchList;
