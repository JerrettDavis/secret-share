import { SecretDefaults } from 'src/models/SecretDefaults';

describe('SecretDefaults', () => {
    let originalEnv: NodeJS.ProcessEnv;

    beforeAll(() => {
        // Save original environment variables
        originalEnv = process.env;
    });

    afterAll(() => {
        // Restore original environment variables
        process.env = originalEnv;
    });

    it('should have default values when environment variables are not set', () => {
        process.env = {}; // Clear environment variables
        const defaults = new SecretDefaults();

        expect(defaults.maxViews).toBe(1);
        expect(defaults.defaultExpirationLength).toBe(604800000);
        expect(defaults.destroyOnFailedAccess).toBe(false);
    });

    it('should set values from environment variables', () => {
        process.env = {
            MAX_VIEWS: '10',
            DEFAULT_EXPIRATION_LENGTH: '86400000', // 1 day in milliseconds
            DESTROY_ON_FAILED_ACCESS: 'true'
        };
        const defaults = new SecretDefaults();

        expect(defaults.maxViews).toBe(10);
        expect(defaults.defaultExpirationLength).toBe(86400000);
        expect(defaults.destroyOnFailedAccess).toBe(true);
    });

    it('should fallback to default values if environment variables are invalid', () => {
        process.env = {
            MAX_VIEWS: 'invalid_number',
            DEFAULT_EXPIRATION_LENGTH: 'invalid_number',
            DESTROY_ON_FAILED_ACCESS: 'invalid_boolean'
        };
        const defaults = new SecretDefaults();

        expect(defaults.maxViews).toBe(1);
        expect(defaults.defaultExpirationLength).toBe(604800000);
        expect(defaults.destroyOnFailedAccess).toBe(false);
    });
});
