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
vector<entry> getMatchesFromMap(string prefix) {
  // cout << "finding matches" << endl;
  vector<entry> matches;
  string upper = prefix;
  if (upper.size() > 0) {
    upper[upper.size() - 1]++;
  }
  for (auto it = countriesMap.lower_bound(prefix); it != countriesMap.upper_bound(upper); it++) {
    matches.push_back(*it);
  }
  // for (auto e : matches) {
  //   cout << e.first << " " << e.second << endl;
  // }
  return matches;
}

// int main() {
//   vector<entry> countries = {
//       {"Rahul", 323232},
//       {"Mehak", 323232},
//       {"Raman", 323232},
//       {"Aman", 323232},
//       {"Rahil", 323232},
//       {"Rahil", 323232},

//   };
//   populateMap(countries);
//   vector<entry> matches = getMatchesFromMap("Rah");
//   // for (auto e : matches) {
//   //   cout << e.first << " " << e.second << endl;
//   // }
//   return 0;
// }
