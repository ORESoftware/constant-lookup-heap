"use strict";

import * as util from "util";
import * as safe from '@oresoftware/safe-stringify';

export const r2gSmokeTest = function () {
  // r2g command line app uses this exported function
  return true;
};

export interface Value {
  getCompareValue(): number;
}

class Wrapper<V extends Value> {
  leftChild: Wrapper<V>;
  rightChild: Wrapper<V>;
  parent: Wrapper<V>;
  val: V;

  constructor(val: V) {
    this.val = val;
    this.leftChild = <Wrapper<V>>(<unknown>null);
    this.parent = <Wrapper<V>>(<unknown>null);
    this.rightChild = <Wrapper<V>>(<unknown>null);
  }

  toJSON(){
    return {
      [this.val.getCompareValue()]: {
        left: this.leftChild && this.leftChild.toJSON(),
        right: this.rightChild && this.rightChild.toJSON()
      }
    }
  }

  getCompareValue() {
    return this.val.getCompareValue();
  }
}

export class MinHeap<Key, V extends Value> {
  map = new Map<Key, V>();
  root: Wrapper<V>;
  toe: Wrapper<V>;

  constructor() {
    this.root = <Wrapper<V>>(<unknown>null);
    this.toe = <Wrapper<V>>(<unknown>null);
  }

  private swapLeft(child: Wrapper<V>, parent: Wrapper<V>) {

    if (parent.leftChild !== child) {
      throw "implementation error 3";
    }

    if(this.root === parent){
      this.root = child;
    }

    if(this.toe === parent){
      this.toe = child;
    }

    const clc = child.leftChild;
    child.leftChild = parent;
    parent.leftChild = clc;

    child.parent = parent.parent;
    const crc = child.rightChild;
    child.rightChild = parent.rightChild;
    parent.rightChild = crc;
    parent.parent = child;
  }

  private swapRight(child: Wrapper<V>, parent: Wrapper<V>) {

    if (parent.rightChild !== child) {
      throw "implementation error 2";
    }

    if(this.root === parent){
      this.root = child;
    }

    if(this.toe === parent){
      this.toe = child;
    }

    const crc = child.rightChild;
    child.rightChild = parent;
    parent.rightChild = crc;
    child.parent = parent.parent;

    const clc = child.leftChild;
    child.leftChild = parent.leftChild;
    parent.leftChild = clc;
    parent.parent = child;
  }

  private prettyPrint(){

    const q : Array<[number, Wrapper<V>]> = [[0,this.root]];
    const cols = process.stdout.columns;

    let count = 1
    while(q.length){

      count++;
      const [d,v] = q.pop();

      if(v?.leftChild){
        q.push([d + 1, v.leftChild])
      }

      if(v?.rightChild){
        q.push([d + 1, v.rightChild])
      }

      let ws = '';

      for(let v = 0; v < Math.floor(cols/count); v++){
         ws += ' '
      }

      process.stdout.write(ws)
      process.stdout.write(v.getCompareValue().toString())

      if(count >= d/2){
        count = 0;
        process.stdout.write('\n')
      }

    }

  }

  private bubbleUp(w: Wrapper<V>) {

    // console.log(JSON.stringify(JSON.parse(safe.stringify(this.root)), null, 2))

    this.prettyPrint();

    if (w.parent === null) {
      return;
    }

    if (w.parent.getCompareValue() <= w.getCompareValue()) {
      return;
    }

    if (w.parent.leftChild === w) {
      this.swapLeft(w, w.parent);
    } else if (w.parent.rightChild === w) {
      this.swapRight(w, w.parent);
    } else {
      throw new Error("implementation error 1");
    }

    this.bubbleUp(w);
  }

  add(k: Key, v: V): boolean {

    if (this.map.has(k)) {
      throw new Error(`map already has key '${k}'`);
    }

    if(!(v && typeof v.getCompareValue === 'function')){
      throw new Error('inserted value must be defined and have a "getCompareValue" method.')
    }

    this.map.set(k, v);
    const w = new Wrapper<V>(v);

    if (this.root === null) {
      this.root = this.toe = w;
      return true;
    }

    if (!this.toe.leftChild) {
      this.toe.leftChild = w;
      w.parent = this.toe;
    } else if (!this.toe.rightChild) {
      this.toe.rightChild = w;
      w.parent = this.toe
      this.toe = this.toe.leftChild
    }

    this.bubbleUp(w);
    return true;
  }

  readMin(){

    if(this.root === null){
      throw new Error('heap is empty, cannot read min value')
    }

    return this.root.val;
  }

  readMax(){
    if(this.root === null){
      throw 'heap is empty, cannot read min value'
    }

    if(this.toe === null){
      throw new Error('implementation error 4')
    }

    if(this.toe.rightChild)
      if(this.toe.leftChild.getCompareValue() <= this.toe.rightChild.getCompareValue()){
      return this.toe.rightChild.val;
    }

    if(this.toe.leftChild){
      return this.toe.leftChild.val;
    }

    return this.toe.val;

  }

  removeByKey(k: Key) {

  }

  removeMax() {

  }

  removeMin() {

  }

  lookup(k: Key): V {
    return this.map.get(k) as V;
  }
}
