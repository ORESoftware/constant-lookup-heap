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

  toJSON(): any{
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

export class Troop implements Value {

  val: number;

  constructor(val: number) {
    this.val = val;
  }

  getCompareValue(): number {
    return this.val;
  }

}

export class MinHeap<Key, V extends Value> {
  map = new Map<Key, V>();
  root: Wrapper<V>;
  size = 0

  constructor() {
    // this.root = <Wrapper<V>>(<unknown>null);
    // this.toe = <Wrapper<V>>(<unknown>null);
    this.root = new Wrapper<V>(new Troop(0))
  }

  private swapLeft(child: Wrapper<V>, parent: Wrapper<V>) {

    if (parent.leftChild !== child) {
      throw "implementation error 3";
    }

    if(this.root === parent){
      this.root = child;
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

    type Elem = [number, Wrapper<V>]

    const q : Array<Elem> = [[0,this.root]];
    const cols = process.stdout.columns;

    let count = 1
    while(q.length){

      count++;
      const [d,v] = q.pop() as Elem;

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

    // this.prettyPrint();

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

  private findElemAt(num: number): Wrapper<V>{

    // https://math.stackexchange.com/questions/3955698

    const binaryRepresentation = num.toString(2);
    const list = binaryRepresentation.split('').slice(1); // remove first element with slice

    console.log({list});

    let el = this.root;

    while(list.length){
      const v = list.pop()
      if(v === '0'){
        el = el.leftChild;
      } else if (v === '1'){
        el = el.rightChild;
      } else {
        throw new Error(`implementation error 99`)
      }
    }

    return el;

  }

  add(k: Key, v: V): boolean {

    if (this.map.has(k)) {
      throw new Error(`map already has key '${k}'`);
    }

    if(!(v && typeof v.getCompareValue === 'function')){
      throw new Error('inserted value must be defined and have a "getCompareValue" method.')
    }

    if(this.size !== this.map.size){
      throw new Error('implementation error 55')
    }

    const nextLoc = ++this.size;
    this.map.set(k, v);

    const w = new Wrapper<V>(v);

    if (this.root === null) {
      this.root = w;
      return true;
    }

    const toe = this.findElemAt(Math.floor(nextLoc/2))

    if (!toe.leftChild) {
      toe.leftChild = w;
      w.parent = toe;
    } else if (!toe.rightChild) {
      toe.rightChild = w;
      w.parent = toe
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

    const maxElemParent = this.findElemAt(Math.floor(this.size/2))

    if(maxElemParent.rightChild)
      if(maxElemParent.leftChild.getCompareValue() <= maxElemParent.rightChild.getCompareValue()){
      return maxElemParent.rightChild.val;
    }

    if(maxElemParent.leftChild){
      return maxElemParent.leftChild.val;
    }

    return maxElemParent.val;

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
