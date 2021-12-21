/**
 * File:    main.cpp
 * Notes:
 *  Work in progress for add on module for node.js 'test'
 * History:
 *  2021/03/11 Written by Simon Platten
 */
#include <napi.h>

#include <iostream>
#include <string>
/**
 * Return "Hello " + user name passed back
 */
Napi::String greet(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();
  std::string strResult = "Welcome ";
  strResult += info[0].ToString();
  return Napi::String::New(env, strResult);
}
/**
 * Callback method when module is registered with Node.js
 */
Napi::Object Init(Napi::Env env, Napi::Object exports) {
  exports.Set(
      Napi::String::New(env, "greet"),
      Napi::Function::New(env, greet));
  return exports;
}
NODE_API_MODULE(test, Init);