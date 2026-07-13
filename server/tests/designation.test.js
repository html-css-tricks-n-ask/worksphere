 function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }import { jest } from '@jest/globals';
import { designationRepository } from '../src/repositories/designation.repository.js';
import Designation from '../src/models/Designation.js';

describe('DesignationRepository Test Suite', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  it('should successfully create designation', async () => {
    const mockDesig = {
      title: 'Senior Software Engineer',
      level: 'L3',
      id: 'desig_456',
    };

    const spyCreate = jest.spyOn(Designation, 'create').mockImplementation((async (payload) => {
      return { ...mockDesig, ...payload } ;
    }) );

    const result = await designationRepository.create({
      title: 'Senior Software Engineer',
      level: 'L3',
    } );

    expect(result.title).toBe('Senior Software Engineer');
    expect(result.level).toBe('L3');
    expect(spyCreate).toHaveBeenCalled();
  });

  it('should find designation by title', async () => {
    const mockDesig = {
      title: 'Architect',
      level: 'L5',
      id: 'desig_789',
    };

    const spyFindOne = jest.spyOn(Designation, 'findOne').mockResolvedValue(mockDesig );

    const result = await designationRepository.findByTitle('Architect');

    expect(_optionalChain([result, 'optionalAccess', _ => _.level])).toBe('L5');
    expect(spyFindOne).toHaveBeenCalled();
  });
});
