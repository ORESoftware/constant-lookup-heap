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

    if(this.rightChild === this){
      throw 'right child is this'
    }

    if(this.leftChild === this){
      throw 'left child is this'
    }

    return {
      [this.val.getCompareValue()]: {
        left: this.leftChild && this.leftChild.getCompareValue(),
        right: this.rightChild && this.rightChild.getCompareValue(),
        parent: this.parent && this.parent.getCompareValue()
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

let rootNull= 0

export class MinHeap<Key, V extends Value> {

  map = new Map<Key, V>();
  root: Wrapper<V>;
  size = 0

  constructor() {
    this.root = <Wrapper<V>>(<unknown>null);
    // this.root = new Wrapper<V>(new Troop(0))
  }

  private swapLeft(child: Wrapper<V>, parent: Wrapper<V>) {

    if (parent.leftChild !== child) {
      throw "implementation error 3";
    }

    if(child.parent !== parent){
      throw 'child parent is not parent in left swap'
    }

    if(this.root === parent){
      // throw 'this works xxx'
      this.root = child;
    }

    const clc = child.leftChild;
    const crc = child.rightChild;
    const prc = parent.rightChild

    child.parent = parent.parent;
    child.leftChild = parent;
    parent.leftChild = clc;
    child.rightChild = prc;
    parent.rightChild = crc;
    parent.parent = child;

  }

  private swapRight(child: Wrapper<V>, parent: Wrapper<V>) {

    if (parent.rightChild !== child) {
      throw "implementation error 2";
    }

    if(child.parent !== parent){
      throw 'child parent is not parent in right swap'
    }

    if(this.root === parent){
      // throw 'this works szz'
      this.root = child;
    }

    const crc = child.rightChild;
    const clc = child.leftChild;
    const plc = parent.leftChild
    const pp = parent.parent

    child.parent = pp;
    parent.parent = child;
    child.leftChild = plc;
    parent.leftChild = clc;
    parent.rightChild = crc;
    child.rightChild = parent;

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

    if (!w.parent) {
      if(this.root !== w){
        throw new Error('root is not equal to expected object')
      }
      return;
    }

    if (w.parent.getCompareValue() <= w.getCompareValue()) {
      // we dont swap if parent value is less than or equal
      return;
    }

    const wParent = w.parent

    console.log('w before:', JSON.stringify(w, null, 2));

    if (w.parent.leftChild === w) {
      this.swapLeft(w, w.parent);
    } else if (w.parent.rightChild === w) {
      this.swapRight(w, w.parent);
    } else {
      // console.log(util.inspect({w},{depth:50}))
      throw new Error("implementation error 1");
    }

    // console.log('w after:', util.inspect(w, {depth:30}));
    console.log('w after:', JSON.stringify(w, null, 2));
    console.log('w parent after:', JSON.stringify(wParent, null, 2));
    console.log('root:', JSON.stringify(this.root, null, 2));

    this.bubbleUp(w);
  }

  private findElemAt(num: number): Wrapper<V>{

    // https://math.stackexchange.com/questions/3955698

    const binaryRepresentation = num.toString(2);
    const list = binaryRepresentation.split('').slice(1); // remove first element with slice

    console.log({nextLoc: num, list, binaryRepresentation})

    let el = this.root;

    while(list.length > 0){
      const v = list.pop()
      if(v === '0'){
        el = el.leftChild;
      } else if (v === '1'){
        el = el.rightChild;
      } else {
        throw new Error(`implementation error 99`)
      }
    }

    console.log(el.getCompareValue())

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

    console.log('w in:', JSON.stringify(v, null, 2));

    const nextLoc = ++this.size;
    this.map.set(k, v);

    const w = new Wrapper<V>(v);

    if (this.root === null) {
      rootNull++
      if(rootNull > 1){
        throw new Error('root should never be null')
      }
      this.root = w;
      return true;
    }

    const toe = this.findElemAt(Math.floor(nextLoc/2))

    console.log('toe:', JSON.stringify(toe, null, 2));

    if (!toe.leftChild) {

      if(toe.rightChild){
        throw new Error('no left child, but has right child .. sad')
      }

      toe.leftChild = w;

    } else if (!toe.rightChild) {

      if(!toe.leftChild){
        throw new Error('attempting to assign to right child but no left?')
      }

      toe.rightChild = w;

    } else {
      // console.log(util.inspect({toe}, {depth: 30}));
      throw new Error('toe should not have two children!!')
    }

    w.parent = toe;

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
