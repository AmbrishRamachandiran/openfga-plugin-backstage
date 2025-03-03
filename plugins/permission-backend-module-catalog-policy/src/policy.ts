import {
  AuthorizeResult,
  PolicyDecision,
  isResourcePermission,
} from '@backstage/plugin-permission-common';
import {
  PermissionPolicy,
  PolicyQuery,
} from '@backstage/plugin-permission-node';
import { BackstageIdentityResponse } from '@backstage/plugin-auth-node';
import { OpenFgaClient } from '@infosys_ltd/backstage-plugin-openfga-common';
import { ConfigApi, DiscoveryApi } from '@backstage/core-plugin-api';

export class OpenFgaCatalogPolicy implements PermissionPolicy {
  private openFgaClient: OpenFgaClient;

  constructor(configApi: ConfigApi, discoveryApi: DiscoveryApi) {
    this.openFgaClient = OpenFgaClient.fromConfig(configApi, discoveryApi);
  }

  async handle(
    request: PolicyQuery,
    user: BackstageIdentityResponse,
  ): Promise<PolicyDecision> {
    // Check if the request is for catalog-entity permissions
    if (isResourcePermission(request.permission, 'catalog-entity')) {
      if (request.permission.name === 'catalog.entity.delete') {
        // Currently entityName is hardcoded, Load Entity based on the entity selection if possible
        const entityName = 'example-website';
        const userName = user.identity.ownershipEntityRefs;

        if (!entityName) {
          // If entity name is not provided, deny the permission
          return { result: AuthorizeResult.DENY };
        }

        try {
          // Send a permission request to the OpenFGA API using the client instance
          const response = await this.openFgaClient.sendPermissionRequest(
            entityName,
            'Delete',
            userName,
          );

          // Return ALLOW or DENY based on the response from the OpenFGA API
          return response.allowed
            ? { result: AuthorizeResult.ALLOW }
            : { result: AuthorizeResult.DENY };
        } catch (error) {
          console.error('Error checking permission:', error);
          return { result: AuthorizeResult.DENY };
        }
      }

      // For other catalog-entity permissions, you can add additional conditions here
      return { result: AuthorizeResult.ALLOW };
    }

    // Deny all other permissions by default
    return { result: AuthorizeResult.DENY };
  }
}
