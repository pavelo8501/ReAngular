import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { ControlState } from './common/enums/control-state';
import { ActivationState } from './common/enums/activation-state';
import { InputType } from './common/enums/input-type';

export const ENUMS = {
  ControlState,
  ActivationState,
  InputType
}

export function provideEnums(): EnvironmentProviders {
  return makeEnvironmentProviders([{ provide: ENUMS, useValue: ENUMS }]);
}