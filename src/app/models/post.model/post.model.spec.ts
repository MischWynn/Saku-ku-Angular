import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PostModel } from './post.model';

describe('PostModel', () => {
  let component: PostModel;
  let fixture: ComponentFixture<PostModel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PostModel],
    }).compileComponents();

    fixture = TestBed.createComponent(PostModel);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
