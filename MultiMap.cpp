#include <iostream>
#include <map>
#include <vector>
using namespace std;
typedef pair<string, long int> entry;
multimap<string, long int> countriesMap;
void populateMap(vector<entry>& countries) {
  // cout << "inserting" << endl;
  for (auto p : countries) {
    // cout << p.first << " " << p.second << endl;
    countriesMap.insert(p);
  }
}
/*
page: number;
      limit: number;
      all: boolean;
*/
pair<vector<entry>, unsigned int> getMatchesFromMap(string prefix, int page, int limit, bool all, bool turbo) {
  // cout << "finding matches" << endl;

  vector<entry> matches;
  int startIndex = (page - 1) * limit;
  int endIndex = page * limit;
  unsigned int curIndex = 0;
  string upper = prefix;
  if (upper.size() > 0) {
    upper[upper.size() - 1]++;
  }
  auto startPtr = prefix == "" ? countriesMap.begin() : countriesMap.lower_bound(prefix);
  auto endPtr = prefix == "" ? countriesMap.end() : countriesMap.upper_bound(upper);
  for (auto it = startPtr; it != endPtr; it++) {
    if (all || (curIndex >= startIndex && curIndex < endIndex)) {
      matches.push_back(*it);
    }
    if (turbo && matches.size() >= limit) {
      return {matches, matches.size()};
    }
    curIndex++;
  }
  // for (auto e : matches) {
  //   cout << e.first << " " << e.second << endl;
  // }
  return {matches, curIndex};
}

// int main() {
//   vector<entry> countries = {
//       {"Rahul", 323232},
//       {"Mehak", 323232},
//       {"Raman", 323232},
//       {"Aman", 323232},
//       {"Rahil", 323232},
//       {"Rahrl", 323232},

//   };
//   populateMap(countries);
//   auto res = getMatchesFromMap("Rah", 1, 1, false, false);
//   auto matches = res.first;
//   auto total = res.second;
//   cout << "total: " << total << endl;
//   for (auto e : matches) {
//     cout << e.first << " " << e.second << endl;
//   }
//   // vector<int> vec;
//   // vec.push_back(1);
//   // for (int i = 0; i < vec.size() && i < 100; i++) {
//   //   vec.push_back(i);
//   //   cout << vec[i] << endl;
//   // }
//   return 0;
// }
