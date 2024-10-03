import { Registry } from '../../../../platform/registry/common/platform.js';
import { Extensions } from '../../../common/configuration.js';
Registry.as(Extensions.ConfigurationMigration)
    .registerConfigurationMigrations([{
        key: 'debug.autoExpandLazyVariables',
        migrateFn: (value) => {
            if (value === true) {
                return { value: 'on' };
            }
            else if (value === false) {
                return { value: 'off' };
            }
            return [];
        }
    }]);
