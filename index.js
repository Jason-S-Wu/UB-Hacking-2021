const axios = require('axios');
const cheerio = require('cheerio');

async function getSchedule(semester, dep) {
  const url = `http://www.buffalo.edu/class-schedule?switch=showcourses&semester=${semester}&division=UGRD&dept=${dep}`;
  const response = await axios.get(url);
  let data = response.data;
  data = cheerio.load(data);
  let result = [];
  let length = data('body > table:nth-child(10) > tbody').children().length;
  for (let i = 5; i <= length; i++) {
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

async function rateMyProfessor(instructor) {
  const url = 'https://www.ratemyprofessors.com/graphql';
  let headers = {
    Authorization: 'Basic dGVzdDp0ZXN0',
  };
  let postData = {
    query:
      'query TeacherSearchResultsPageQuery(\n  $query: TeacherSearchQuery!\n  $schoolID: ID\n) {\n  search: newSearch {\n    ...TeacherSearchPagination_search_1ZLmLD\n  }\n  school: node(id: $schoolID) {\n    __typename\n    ... on School {\n      name\n    }\n    id\n  }\n}\n\nfragment TeacherSearchPagination_search_1ZLmLD on newSearch {\n  teachers(query: $query, first: 8, after: "") {\n    didFallback\n    edges {\n      cursor\n      node {\n        ...TeacherCard_teacher\n        id\n        __typename\n      }\n    }\n    pageInfo {\n      hasNextPage\n      endCursor\n    }\n    resultCount\n  }\n}\n\nfragment TeacherCard_teacher on Teacher {\n  id\n  legacyId\n  avgRating\n  numRatings\n  ...CardFeedback_teacher\n  ...CardSchool_teacher\n  ...CardName_teacher\n  ...TeacherBookmark_teacher\n}\n\nfragment CardFeedback_teacher on Teacher {\n  wouldTakeAgainPercent\n  avgDifficulty\n}\n\nfragment CardSchool_teacher on Teacher {\n  department\n  school {\n    name\n    id\n  }\n}\n\nfragment CardName_teacher on Teacher {\n  firstName\n  lastName\n}\n\nfragment TeacherBookmark_teacher on Teacher {\n  id\n  isSaved\n}\n',
    variables: {
      query: {
        text: `${instructor}`,
        schoolID: 'U2Nob29sLTk2MA==',
        fallback: true,
      },
      schoolID: 'U2Nob29sLTk2MA==',
    },
  };
  const response = await axios.post(url, postData, {
    headers: headers,
  });
  let instructorData = response.data.data.search.teachers.edges[0].node;
  let returnData = {};
  returnData.name = instructorData.lastName;
  returnData.difficulty = instructorData.avgDifficulty;
  returnData.rating = instructorData.avgRating;
  returnData.numRatings = instructorData.numRatings;
  return returnData;
}
