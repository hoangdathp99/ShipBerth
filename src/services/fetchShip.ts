import axios from "axios";

const fetchShips = async ({ pageParam = 1, searchQuery = "" }) => {    
  const { data } = await axios.get(`/api/getShip?page=${pageParam}&limit=10&q=${searchQuery}`);
  return data;
};

export default fetchShips;
