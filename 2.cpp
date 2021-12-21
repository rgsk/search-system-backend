#include <napi.h>

using namespace Napi;
using namespace std;
bool search(string word);
bool startsWith(string word);
void populate(vector<string>& words);
// vector<string> getMatches(string prefix);
// Napi::Array GetMatches(const CallbackInfo& info) {
//   Env env = info.Env();
//   string prefix = info[0].As<Napi::String>();
//   vector<string> matches = getMatches(prefix);
//   Array returnedMatches = Napi::Array::New(env, matches.size());
//   for (int i = 0; i < matches.size(); i++) {
//     Napi::String str = Napi::String::New(env, matches[i]);
//     returnedMatches[i] = str;
//   }
//   return returnedMatches;
// }
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
Napi::Boolean StartsWith(const CallbackInfo& info) {
  Env env = info.Env();
  string word = info[0].As<Napi::String>();
  bool ans = startsWith(word);
  return Napi::Boolean::New(env, ans);
}
String Hello(const CallbackInfo& info) {
  return String::New(info.Env(), "world");
}
Napi::Object Init(Napi::Env env, Napi::Object exports) {
  exports.Set("hello", Function::New(env, Hello));
  exports.Set("search", Function::New(env, Search));
  exports.Set("startsWith", Function::New(env, StartsWith));
  exports.Set("populate", Function::New(env, Populate));
  // exports.Set("getMatches", Function::New(env, GetMatches));
  return exports;
}
NODE_API_MODULE(addon, Init)
