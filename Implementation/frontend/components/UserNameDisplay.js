import React, { useState, useEffect } from 'react';
import { Text } from 'react-native';
import axios from 'axios';
import API_BASE_URL from '../config';

const UserNameDisplay = ({ userId }) => {
  const [name, setName] = useState(null);

  useEffect(() => {
    const fetchName = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/users/${userId}`);
        if (response.status === 200) {
          setName(response.data.name);
        } else {
          setName("Unknown");
        }
      } catch (error) {
        console.error("Error fetching user name:", error);
        setName("Unknown");
      }
    };
    fetchName();
  }, [userId]);

  // Optionally, you could render nothing until the name is fetched:
  if (!name) return null;
  return <Text>{name}</Text>;
};

export default UserNameDisplay;
