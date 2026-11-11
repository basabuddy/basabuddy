import {it,expect} from 'vitest';
import {studentNavigation} from './navigation';
it('exposes the original four student tabs without purchase routes',()=>{expect(studentNavigation).toHaveLength(4);expect(new Set(studentNavigation.map(i=>i.path)).size).toBe(4);expect(studentNavigation.map(i=>i.path)).toEqual(['home','levels','stories','journey']);});
