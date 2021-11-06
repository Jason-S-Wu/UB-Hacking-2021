const axios = require('axios');
const fs = require('fs');
const cheerio = require('cheerio');

async function getSchedule(semester, dep) {
  const url = `http://www.buffalo.edu/class-schedule?switch=showcourses&semester=${semester}&division=UGRD&dept=${dep}`;
  const response = await axios.get(url);
  let data = response.data;
  data = cheerio.load(data);
  let result = [];
  let length = data('body > table:nth-child(10) > tbody').children().length;
  for (let i = 5; i < length; i++) {
    let course = {};
    course.code = data(
      `body > table:nth-child(10) > tbody > tr:nth-child(${i}) > td:nth-child(2)`
    )
      .text()
      .replace(/(\r\n|\n|\r|\t|\s)/gm, '')
      .replace(/([a-z])([A-Z])/g, '$1 $2');
    course.title = data(
      `body > table:nth-child(10) > tbody > tr:nth-child(${i}) > td:nth-child(3)`
    )
      .text()
      .replace(/(\r\n|\n|\r|\t|\s)/gm, '')
      .replace(/([A-Z\&])/g, ' $1')
      .replace(/([^0-9])([0-9])/g, '$1 $2')
      .trim();
    course.instructor = data(
      `body > table:nth-child(10) > tbody > tr:nth-child(${i}) > td:nth-child(10)`
    )
      .text()
      .replace(/(\r\n|\n|\r|\t|\s)/gm, '')
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .split('*')[0];
    if (course.code.includes('Course')) {
      continue;
    } else if (course.instructor.includes('Staff')) {
      continue;
    } else {
      result.push(course);
    }
  }

  let unique = result.filter(function (elem, index, self) {
    return (
      index ===
      self.findIndex(function (t) {
        return (
          t.code === elem.code &&
          t.title === elem.title &&
          t.instructor === elem.instructor
        );
      })
    );
  });

  return unique;
}
