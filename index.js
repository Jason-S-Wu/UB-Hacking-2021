const axios = require('axios');

async function getSchedule(semester, dep) {
  const url = `http://www.buffalo.edu/class-schedule?switch=showcourses&semester=${semester}&division=UGRD&dept=${dep}`;
  const response = await axios.get(url);
  return response;
}

async function main() {
  let data = await getSchedule('spring', 'CSE');
  console.log(data);
}

main();
