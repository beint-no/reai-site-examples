# Public examples and private client repositories

This is the public source for one full ReAI demo store, reusable code and integration documentation.
Use it for generic design systems, fictional fixtures and reusable integration.
A real client's source, previews, branding and handoff notes belong in an
independent **private** repository from the start.

The private customer-sites operator hub holds overall instructions and Git
submodule pointers. Each child repository owns its history, collaborators,
checks and deployment. A client clones their own repository directly and does
not need access to the hub or any other tenant's source.

Submodules pin commits; they do not distribute permissions. Updating a child
repository does not automatically update the hub pointer. Operators review the
child change, merge it, publish according to that site's instructions, and then
update the hub to the intended reviewed child commit.

Default to one repo per site. Group several Sites per tenant only when every
collaborator is allowed to see every included site and internal note. A shared
accounting tenant is not an automatic Git permission boundary.

Use Write for source editing, Maintain for routine maintenance, or Admin when
the client should manage repository settings and collaborator access, subject
to organization policy. Actual repository ownership requires an authorized
transfer to the client's organization. These choices do not automatically grant
Cloudflare or ReAI tenant management permissions.

## Export a design

`npm run export -- storefront /absolute/new/directory` creates standalone source.
It refuses existing destinations, includes the selected theme and required
Site client, and excludes the local demo harness/catalog. It does not create a
GitHub repository, grant permissions, create a ReAI Site, deploy or change DNS.

## Automated provisioning

ReAI's existing automatic store creator uses a private GitHub template named
reai-storefront-starter. That template is an operational copy exported from
this public repo's standalone storefront template, not a second public examples project.
The public repo is the canonical editable starter source.

An operator refreshes the private template using the export tool, regenerates
its npm lockfile, runs its checks and reviews the resulting change. Existing
client repos are not overwritten when a template changes. GitHub template
creation copies a complete repository; do not point the store creator directly
at this demo repository or every client would inherit the demo store and operator seed tooling.
