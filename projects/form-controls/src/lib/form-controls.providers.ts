import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { ControlState } from './classes/enums/control-state';
import { ActivationState } from './classes/enums/activation-state';
import { InputType } from './classes/enums/input-type';

export const ENUMS = {
    ControlState,
    ActivationState,
    InputType
  }

export function provideEnums(): EnvironmentProviders {
    return makeEnvironmentProviders([{ provide: ENUMS, useValue: ENUMS }]);
  }