import { jest } from '@jest/globals';
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

    const spyCreate = jest.spyOn(Designation, 'create').mockImplementation((async (payload: any) => {
      return { ...mockDesig, ...payload } as any;
    }) as any);

    const result = await designationRepository.create({
      title: 'Senior Software Engineer',
      level: 'L3',
    } as any);

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

    const spyFindOne = jest.spyOn(Designation, 'findOne').mockResolvedValue(mockDesig as any);

    const result = await designationRepository.findByTitle('Architect');

    expect(result?.level).toBe('L5');
    expect(spyFindOne).toHaveBeenCalled();
  });
});
