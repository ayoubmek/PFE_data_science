class GlobalExportManager {
    private container: HTMLElement | null = null;
    private progressBar: HTMLElement | null = null;
    private progressText: HTMLElement | null = null;
    private titleText: HTMLElement | null = null;
    private isVisible: boolean = false;

    private init() {
        if (document.getElementById('arkan-global-export-manager')) {
            this.container = document.getElementById('arkan-global-export-manager');
            this.progressBar = this.container?.querySelector('.progress-bar') as HTMLElement;
            this.progressText = this.container?.querySelector('.progress-text') as HTMLElement;
            this.titleText = this.container?.querySelector('.title-text') as HTMLElement;
            return;
        }

        this.container = document.createElement('div');
        this.container.id = 'arkan-global-export-manager';
        this.container.className = 'position-fixed bottom-0 end-0 p-5 z-index-3';
        this.container.style.zIndex = '9999';
        this.container.style.transition = 'opacity 0.3s ease-in-out, transform 0.3s ease-in-out';
        this.container.style.opacity = '0';
        this.container.style.transform = 'translateY(20px)';
        this.container.style.pointerEvents = 'none';

        this.container.innerHTML = `
            <div class="card shadow-sm" style="min-width: 300px; pointer-events: auto;">
                <div class="card-body p-4">
                    <div class="d-flex align-items-center justify-content-between mb-2">
                        <span class="fw-bold text-gray-800 title-text fs-6">Export en cours...</span>
                        <div class="spinner-border spinner-border-sm text-primary" role="status">
                            <span class="visually-hidden">Loading...</span>
                        </div>
                    </div>
                    <div class="progress h-6px mb-1">
                        <div class="progress-bar bg-primary progress-bar-striped progress-bar-animated" role="progressbar" style="width: 0%" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100"></div>
                    </div>
                    <div class="d-flex justify-content-end text-muted fs-8 fw-semibold progress-text">0%</div>
                </div>
            </div>
        `;

        document.body.appendChild(this.container);

        this.progressBar = this.container.querySelector('.progress-bar');
        this.progressText = this.container.querySelector('.progress-text');
        this.titleText = this.container.querySelector('.title-text');
    }

    start(title: string = 'Export en cours...') {
        this.init();
        if (this.isVisible) return;

        this.isVisible = true;
        if (this.titleText) {
            this.titleText.innerText = title;
            this.titleText.classList.remove('text-success', 'text-danger');
            this.titleText.classList.add('text-gray-800');
        }

        if (this.progressBar) {
            this.progressBar.classList.remove('bg-success', 'bg-danger');
            this.progressBar.classList.add('bg-primary', 'progress-bar-striped', 'progress-bar-animated');
        }

        const iconNode = this.container?.querySelector('.bi');
        if (iconNode) {
            iconNode.outerHTML = `
                <div class="spinner-border spinner-border-sm text-primary" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
            `;
        }

        this.update(0);

        if (this.container) {
            this.container.style.opacity = '1';
            this.container.style.transform = 'translateY(0)';
        }
    }

    update(percentage: number) {
        if (!this.isVisible) this.init();

        const safePercentage = Math.min(Math.max(percentage, 0), 100);

        if (this.progressBar) {
            this.progressBar.style.width = `${safePercentage}%`;
            this.progressBar.setAttribute('aria-valuenow', safePercentage.toString());
        }

        if (this.progressText) {
            this.progressText.innerText = `${safePercentage}%`;
        }
    }

    finish(successMessage: string = 'Export prêt !') {
        if (this.titleText) {
            this.titleText.innerText = successMessage;
            this.titleText.classList.remove('text-gray-800');
            this.titleText.classList.add('text-success');
        }

        if (this.progressBar) {
            this.progressBar.style.width = '100%';
            this.progressBar.classList.remove('bg-primary', 'progress-bar-striped', 'progress-bar-animated');
            this.progressBar.classList.add('bg-success');
        }

        const spinner = this.container?.querySelector('.spinner-border');
        if (spinner) {
            spinner.outerHTML = '<i class="bi bi-check-circle-fill text-success fs-4"></i>';
        }

        if (this.progressText) this.progressText.innerText = '100%';

        setTimeout(() => {
            this.hide();
        }, 3000);
    }

    error(errorMessage: string = "Erreur lors de l'export") {
        if (this.titleText) {
            this.titleText.innerText = errorMessage;
            this.titleText.classList.remove('text-gray-800');
            this.titleText.classList.add('text-danger');
        }

        if (this.progressBar) {
            this.progressBar.classList.remove('bg-primary', 'progress-bar-striped', 'progress-bar-animated');
            this.progressBar.classList.add('bg-danger');
        }

        const spinner = this.container?.querySelector('.spinner-border');
        if (spinner) {
            spinner.outerHTML = '<i class="bi bi-x-circle-fill text-danger fs-4"></i>';
        }

        setTimeout(() => {
            this.hide();
        }, 4000);
    }

    private hide() {
        if (this.container) {
            this.container.style.opacity = '0';
            this.container.style.transform = 'translateY(20px)';
        }
        this.isVisible = false;

        setTimeout(() => {
            if (this.container && this.container.parentNode) {
                this.container.parentNode.removeChild(this.container);
                this.container = null;
            }
        }, 300);
    }
}

export const globalExportManager = new GlobalExportManager();