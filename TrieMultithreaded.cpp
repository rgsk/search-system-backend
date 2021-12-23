#include <future>
#include <iostream>
#include <queue>
#include <thread>

using namespace std;
class Node {
 private:
  Node* links[256];
  bool flag;

 public:
  bool containsKey(int c) {
    return links[c] != NULL;
  }
  void put(int c, Node* node) {
    links[c] = node;
  }
  Node* get(int c) {
    return links[c];
  }
  void setEnd() {
    this->flag = true;
  }
  bool isEnd() {
    return this->flag;
  }
  void merge(Node* node) {
    if (node->isEnd()) {
      this->setEnd();
    }
    for (int i = 0; i < 256; i++) {
      if (node->containsKey(i)) {
        if (!this->containsKey(i)) {
          this->put(i, node->get(i));
        } else {
          this->get(i)->merge(node->get(i));
        }
      }
    }
  }
};
void generateMatchesFromNode(string curString, Node* curNode, vector<string>& matches);
class Trie {
 private:
  Node* root;

 public:
  Trie() {
    root = new Node();
  }

  void insert(string word) {
    Node* temp = root;
    for (int i = 0; i < word.length(); i++) {
      int v = word[i];
      if (!temp->containsKey(v)) {
        temp->put(v, new Node());
      }
      temp = temp->get(v);
    }
    temp->setEnd();
  }
  bool search(string word) {
    Node* temp = root;
    for (int i = 0; i < word.length(); i++) {
      int v = word[i];
      if (!temp->containsKey(v)) {
        return false;
      }
      temp = temp->get(v);
    }
    return temp->isEnd();
  }
  bool startsWith(string prefix) {
    Node* temp = root;
    for (int i = 0; i < prefix.length(); i++) {
      int v = prefix[i];
      if (!temp->containsKey(v)) {
        return false;
      }
      temp = temp->get(v);
    }
    return true;
  }
  vector<string> getMatches(string prefix) {
    vector<string> matches;
    Node* temp = root;
    for (int i = 0; i < prefix.length(); i++) {
      int v = prefix[i];
      if (!temp->containsKey(v)) {
        return matches;
      }
      temp = temp->get(v);
    }
    queue<pair<string, Node*>> myq;
    for (int i = 0; i < 256; i++) {
      char v = i;
      if (temp->containsKey(i)) {
        myq.push({prefix + v, temp->get(i)});
      }
    }
    vector<thread> registeredThreads;
    while (myq.size()) {
      auto values = myq.front();
      myq.pop();
      string curString = values.first;
      Node* curNode = values.second;
      registeredThreads.push_back(thread(generateMatchesFromNode, curString, curNode, ref(matches)));
    }
    // cout << registeredThreads.size() << endl;
    for (int i = 0; i < registeredThreads.size(); i++) {
      registeredThreads[i].join();
    }
    return matches;
  }
  void merge(Trie* other) {
    root->merge(other->root);
  }
};
Trie* formTrie(int start, int end, vector<string>& words) {
  Trie* trie = new Trie();
  for (int i = start; i < end; i++) {
    trie->insert(words[i]);
  }
  return trie;
};
void insertAll(Trie* trie, vector<string>& words) {
  int len = words.size();
  int threadCount = len / 100;
  int start = 0;
  int range = len / threadCount;
  vector<future<Trie*>> registeredFutures;
  for (int i = 0; i < threadCount - 1; i++) {
    registeredFutures.push_back(async(std::launch::async, formTrie, start, start + range, ref(words)));

    start += range;
  }
  registeredFutures.push_back(async(std::launch::async, formTrie, start, start + range + len % threadCount, ref(words)));
  for (int i = 0; i < registeredFutures.size(); i++) {
    Trie* t = registeredFutures[i].get();
    trie->merge(t);
  }
}
void generateMatchesFromNode(string curString, Node* curNode, vector<string>& matches) {
  queue<pair<string, Node*>> myq;
  myq.push({curString, curNode});
  while (!myq.empty()) {
    auto values = myq.front();
    myq.pop();
    string curString = values.first;
    Node* curNode = values.second;
    if (curNode->isEnd()) {
      matches.push_back(curString);
    }
    for (int i = 0; i < 256; i++) {
      char v = i;
      if (curNode->containsKey(i)) {
        myq.push({curString + v, curNode->get(i)});
      }
    }
  }
}
Trie* countriesTrie = new Trie();
void populate(vector<string>& words) {
  countriesTrie = new Trie();

  insertAll(countriesTrie, words);
}
bool search(string word) {
  return countriesTrie->search(word);
}
bool startsWith(string word) {
  return countriesTrie->startsWith(word);
}
vector<string> getMatches(string prefix) {
  return countriesTrie->getMatches(prefix);
}
int main() {
  // string words[] = {"rahul", "mehak", "amani", "rohit", "raman1", "rima"};
  // // cout << sizeof(words) << endl;
  // // cout << sizeof(words[0]) << endl;
  // populate(words, sizeof(words) / sizeof(words[0]));
  // cout << search("rahul") << endl;
  // cout << startsWith("ra") << endl;
  // cout << countriesTrie->search(words[0]) << endl;
  // cout << countriesTrie->startsWith("r") << endl;
  // Trie* trie2 = new Trie();
  // trie2->insert("raman");
  // trie2->insert("raman123");
  // trie2->insert("rama");
  // countriesTrie->merge(trie2);
  // vector<string> matches = countriesTrie->getMatches("r");
  cout << "main ran" << endl;
  return 0;
}