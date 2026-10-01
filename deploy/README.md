# Flux GitOps

CI only builds and pushes `harbor.marc-lab.dev/library/turbo-playground:<run_number>-<sha>`.
Flux scans Harbor, commits the newest tag into `deploy/apps/*.yaml` (lines marked
`$imagepolicy`), and reconciles the cluster from `master`.

```
deploy/
  clusters/k3s/        # bootstrap path; flux-system/ is generated here by `flux bootstrap`
    apps.yaml          # Kustomization -> ./deploy/apps
  apps/
    express.yaml       # HelmRelease for apps/express/helm (adopts the existing turbo-express release)
    front-end.yaml     # Kustomization for the raw manifests in apps/front-end/helm
    image-automation.yaml
```

## Bootstrap

```sh
# Harbor credentials for the image scanner
kubectl create namespace flux-system
kubectl -n flux-system create secret docker-registry harbor-creds \
  --docker-server=harbor.marc-lab.dev \
  --docker-username=<user> --docker-password=<password>

# Needs a GitHub PAT in GITHUB_TOKEN; the deploy key must be writable for image automation
flux bootstrap github \
  --owner=marcmarina \
  --repository=turbo-playground \
  --branch=master \
  --path=deploy/clusters/k3s \
  --personal \
  --read-write-key \
  --components-extra=image-reflector-controller,image-automation-controller
```

## Useful commands

```sh
flux get all -A
flux get images all -A
flux reconcile kustomization apps --with-source
flux suspend helmrelease turbo-express -n default   # pause deploys
```
