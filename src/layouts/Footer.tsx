export function Footer() {
  return (
    <footer className="border-t border-border bg-card mt-auto">

      <div className="page-container">

        {/* TOP */}
        <div
          className="
            py-10
            grid gap-10
            md:grid-cols-2
            lg:grid-cols-4
          "
        >

          {/* BRAND */}
          <div className="space-y-4">

            <div className="flex items-center gap-3">

              <div
                className="
                  w-10 h-10
                  rounded-lg
                  bg-primary
                  text-primary-foreground
                  flex-center
                  font-bold
                "
              >
                VS
              </div>

              <div>
                <h3 className="text-base font-semibold text-foreground">
                  VendorSync
                </h3>

                <p className="text-xs text-muted-foreground">
                  Vendor Management System
                </p>
              </div>

            </div>

            <p
              className="
                text-sm
                leading-6
                text-muted-foreground
                max-w-xs
              "
            >
              Enterprise procurement and vendor management
              platform built to streamline sourcing,
              compliance, approvals, and procurement
              operations.
            </p>

          </div>

          {/* PLATFORM */}
          <div>

            <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">
              Platform
            </h3>

            <ul className="mt-4 space-y-3">

              {[
                "Dashboard",
                "Purchase Orders",
                "Vendor Management",
                // "Invoices",
                // "Reports",
              ].map((item) => (
                <li key={item}>

                  <button
                    className="
                      text-sm
                      text-muted-foreground
                      hover:text-primary
                      transition-colors
                    "
                  >
                    {item}
                  </button>

                </li>
              ))}

            </ul>

          </div>

          {/* SUPPORT */}
          <div>

            <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">
              Support
            </h3>

            <ul className="mt-4 space-y-3 text-sm text-muted-foreground">

              <li className="flex items-start gap-2">
                <i className="pi pi-envelope mt-1 text-xs" />

                <a
                  href="#"
                  className="hover:text-primary transition-colors"
                >
                  support@vendorsync.com
                </a>
              </li>

              <li className="flex items-start gap-2">
                <i className="pi pi-phone mt-1 text-xs" />

                <span>
                  +91 98765 43210
                </span>
              </li>

              <li className="flex items-start gap-2">
                <i className="pi pi-clock mt-1 text-xs" />

                <span>
                  Mon - Fri | 9:00 AM - 6:00 PM
                </span>
              </li>

            </ul>

          </div>

          {/* OFFICE */}
          <div>

            <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">
              Office
            </h3>

            <div
              className="
                mt-4
                text-sm
                leading-6
                text-muted-foreground
              "
            >
              VendorSync Technologies Pvt Ltd
              <br />
              HITEC City, Madhapur
              <br />
              Hyderabad, Telangana 500081
              <br />
              India
            </div>

          </div>

        </div>

        {/* BOTTOM */}
        <div
          className="
            border-t border-border
            py-5
            flex flex-col gap-3
            md:flex-row
            md:items-center
            md:justify-between
          "
        >

          <div className="text-sm text-muted-foreground">
            © 2026 VendorSync. All rights reserved.
          </div>

          <div
            className="
              flex flex-wrap items-center gap-5
              text-sm text-muted-foreground
            "
          >

            <button className="hover:text-primary transition-colors">
              Privacy Policy
            </button>

            <button className="hover:text-primary transition-colors">
              Terms of Service
            </button>

            <button className="hover:text-primary transition-colors">
              Security
            </button>

          </div>

        </div>

      </div>

    </footer>
  );
}