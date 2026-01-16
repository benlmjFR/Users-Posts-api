import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { beforeEach, describe, it, expect } from '@jest/globals';

void describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  void it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
