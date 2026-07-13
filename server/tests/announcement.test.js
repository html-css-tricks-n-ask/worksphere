import { jest } from '@jest/globals';
import { announcementRepository } from '../src/repositories/announcement.repository.js';
import Announcement from '../src/models/Announcement.js';

describe('Announcements Repository Tests', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  it('should create new pinned company bulletin', async () => {
    const mockBulletin = {
      title: 'Q3 Town Hall Notice',
      content: 'Agenda details',
      pinned: true,
    };

    const spyCreate = jest.spyOn(Announcement, 'create').mockImplementation((async (payload) => {
      return { ...mockBulletin, ...payload } ;
    }) );

    const result = await announcementRepository.create({
      title: 'Q3 Town Hall Notice',
      content: 'Agenda details',
      pinned: true,
    } );

    expect(result.pinned).toBe(true);
    expect(spyCreate).toHaveBeenCalled();
  });
});
