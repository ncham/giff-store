import { TestBed } from '@angular/core/testing';

import { GiphySearchService } from './giphy-search.service';

describe('GiphySearchService', () => {
  let service: GiphySearchService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GiphySearchService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
