import m1 from 'module1';
import m2 from 'module2';
import { e1, e2, e3 } from '@scope/module3';
import * as m4 from '@scope/module4';
import m5, { e4 } from '@scope/module5';
import { e5 } from './local-module1';


export interface Test {
  key1: string;
  key2: string;
  key3: number;
}

export function name(p1: string, p2: number): Promise<void> {
  console.log(p1, p2);
  return Promise.resolve();
}

export {
  m1,
  m2,
  m4,
  m5,
  e1,
  e2,
  e3,
  e4,
  e5,
}