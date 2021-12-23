#include <napi.h>

#include <iostream>
using namespace Napi;
using namespace std;
bool search(string word);
bool startsWith(string word);
void populate(vector<string>& words);
vector<string> getMatches(string prefix);

typedef pair<string, long int> entry;
void populateMap(vector<entry>& countries);
pair<vector<entry>, unsigned int> getMatchesFromMap(string prefix, int page, int limit, bool all, bool turbo);

void PopulateMap(const CallbackInfo& info) {
  Env env = info.Env();
  Array names = info[0].As<Array>();
  Array uuids = info[1].As<Array>();
  vector<entry> countries;
  for (int i = 0; i < names.Length(); i++) {
    Napi::Value nameValue = names[i];
    Napi::String name = nameValue.As<Napi::String>();
    Value uuidValue = uuids[i];
    long int uuid = uuidValue.ToNumber().Int64Value();
    countries.push_back({name, uuid});
  }

  populateMap(countries);
}
Napi::Object GetMatchesFromMap(const CallbackInfo& info) {
  Env env = info.Env();
  string prefix = info[0].As<Napi::String>();
  int page = info[1].As<Napi::Number>();
  int limit = info[2].As<Napi::Number>();
  bool all = info[3].As<Napi::Boolean>();
  bool turbo = info[4].As<Napi::Boolean>();
  // cout << prefix << page << limit << all << endl;

  Napi::Object finalResult = Napi::Object::New(env);

  // return finalResult;
  auto res = getMatchesFromMap(prefix, page, limit, all, turbo);
  auto matches = res.first;

  auto total = res.second;
  Array returnedMatches = Napi::Array::New(env, matches.size());
  for (int i = 0; i < matches.size(); i++) {
    // Napi::String name = Napi::String::New(env, matches[i].first);
    // Napi::Number uuid = Napi::Number::New(env, matches[i].second);
    Napi::Object country = Napi::Object::New(env);
    country.Set("uuid", matches[i].second);
    country.Set("name", matches[i].first);
    returnedMatches[i] = country;
  }
  finalResult.Set("total", total);
  finalResult.Set("countries", returnedMatches);
  return finalResult;
}
Napi::Array
GetMatches(const CallbackInfo& info) {
  Env env = info.Env();
  string prefix = info[0].As<Napi::String>();
  vector<string> matches = getMatches(prefix);
  Array returnedMatches = Napi::Array::New(env, matches.size());
  for (int i = 0; i < matches.size(); i++) {
    Napi::String str = Napi::String::New(env, matches[i]);
    returnedMatches[i] = str;
  }
  return returnedMatches;
}
Napi::Boolean Search(const CallbackInfo& info) {
  Env env = info.Env();
  string word = info[0].As<Napi::String>();
  bool ans = search(word);
  return Napi::Boolean::New(env, ans);
}
void Populate(const CallbackInfo& info) {
  Array passedWords = info[0].As<Array>();
  vector<string> words;
  for (int i = 0; i < passedWords.Length(); i++) {
    Napi::Value v = passedWords[i];
    Napi::String str = v.As<Napi::String>();
    words.push_back(str);
  }

  populate(words);
}
Napi::Boolean StartsWith(const CallbackInfo& info) {
  Env env = info.Env();
  string word = info[0].As<Napi::String>();
  bool ans = startsWith(word);
  return Napi::Boolean::New(env, ans);
}
String Hello(const CallbackInfo& info) {
  cout << "Hello from binding" << endl;
  return String::New(info.Env(), "world");
}
Napi::Object Init(Napi::Env env, Napi::Object exports) {
  exports.Set("hello", Function::New(env, Hello));
  exports.Set("search", Function::New(env, Search));
  exports.Set("startsWith", Function::New(env, StartsWith));
  exports.Set("populate", Function::New(env, Populate));
  exports.Set("getMatches", Function::New(env, GetMatches));
  exports.Set("populateMap", Function::New(env, PopulateMap));
  exports.Set("getMatchesFromMap", Function::New(env, GetMatchesFromMap));
  return exports;
}
NODE_API_MODULE(addon, Init)
