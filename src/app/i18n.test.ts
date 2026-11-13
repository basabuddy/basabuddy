import {describe,it,expect} from 'vitest';
import {translate} from './i18n';

describe('interface translation',()=>{
 it('switches labels without changing English or learner text',()=>{
  expect(translate('fil','Continue')).toBe('Magpatuloy');
  expect(translate('en','Continue')).toBe('Continue');
  expect(translate('fil','Luna')).toBe('Luna');
  expect(translate('en','Aling salita ang tama?')).toBe('Which word is correct?');
 });
 it('preserves spacing and interpolates changing counts',()=>{
  expect(translate('fil',' Grade ')).toBe(' Baitang ');
  expect(translate('fil','You explored {0} flashcards.',[4])).toBe('Natuklasan mo ang 4 kard.');
 });
});
