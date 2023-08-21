import { Test, TestingModule } from '@nestjs/testing';
import { MovesGateway } from './moves.gateway';

describe('MovesGateway', () => {
  let gateway: MovesGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MovesGateway],
    }).compile();

    gateway = module.get<MovesGateway>(MovesGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
