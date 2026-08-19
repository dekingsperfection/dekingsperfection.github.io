/* =========================================================
   DKPS RESULT PORTAL
   2025 / 2026
   ========================================================= */


/* =========================================================
   SETTINGS
   ========================================================= */

const DATA_URL = "data/result-data.json";


/* =========================================================
   GLOBAL DATA
   ========================================================= */

let resultData = null;


/* =========================================================
   DOM ELEMENTS
   ========================================================= */

const resultForm =
    document.getElementById("resultForm");

const loginIdInput =
    document.getElementById("loginId");

const pinInput =
    document.getElementById("pin");

const togglePin =
    document.getElementById("togglePin");

const loginMessage =
    document.getElementById("loginMessage");

const checkResultButton =
    document.getElementById("checkResultButton");

const buttonText =
    document.getElementById("buttonText");

const resultSection =
    document.getElementById("resultSection");


/* =========================================================
   LOAD JSON DATA
   ========================================================= */

async function loadResultData() {

    try {

        const response =
            await fetch(DATA_URL, {
                cache: "no-store"
            });


        if (!response.ok) {

            throw new Error(
                `Unable to load result data. Status: ${response.status}`
            );

        }


        resultData =
            await response.json();


        console.log(
            "DKPS result data loaded successfully."
        );


    } catch (error) {

        console.error(error);

        showMessage(
            "The result system could not load its data. Make sure result-data.json is inside the data folder and that you are running the project through a web server.",
            true
        );

        if (checkResultButton) {

            checkResultButton.disabled = true;

        }

    }

}


/* =========================================================
   PAGE LOAD
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        loadResultData();

    }
);


/* =========================================================
   PIN SHOW / HIDE
   ========================================================= */

if (togglePin) {

    togglePin.addEventListener(
        "click",
        function () {

            if (
                pinInput.type === "password"
            ) {

                pinInput.type = "text";

                togglePin.textContent =
                    "Hide";

            } else {

                pinInput.type = "password";

                togglePin.textContent =
                    "Show";

            }

        }
    );

}


/* =========================================================
   FORM SUBMISSION
   ========================================================= */

if (resultForm) {

    resultForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            clearMessage();


            const loginId =
                loginIdInput.value
                    .trim()
                    .toUpperCase();

            const pin =
                pinInput.value
                    .trim();


            /* =========================
               VALIDATION
            ========================== */

            if (!loginId) {

                showMessage(
                    "Please enter your Student Login ID.",
                    true
                );

                loginIdInput.focus();

                return;
            }


            if (!pin) {

                showMessage(
                    "Please enter your Result PIN.",
                    true
                );

                pinInput.focus();

                return;
            }


            if (!/^\d{4}$/.test(pin)) {

                showMessage(
                    "Your PIN must contain exactly 4 digits.",
                    true
                );

                pinInput.focus();

                return;
            }


            if (!resultData) {

                showMessage(
                    "Result data is still loading. Please try again.",
                    true
                );

                return;
            }


            /* =========================
               START LOADING
            ========================== */

            setLoading(true);


            /*
             * Small delay gives the interface a natural
             * verification effect.
             */

            await wait(500);


            /* =========================
               FIND STUDENT
            ========================== */

            const students =
                Array.isArray(resultData.students)
                    ? resultData.students
                    : [];


            const student =
                students.find(
                    function (item) {

                        return (
                            String(item.login_id)
                                .trim()
                                .toUpperCase()
                            === loginId

                            &&

                            String(item.pin)
                                .trim()
                            === pin
                        );

                    }
                );


            /* =========================
               INVALID LOGIN
            ========================== */

            if (!student) {

                setLoading(false);

                hideResult();

                showMessage(
                    "Invalid Student Login ID or PIN. Please check your details and try again.",
                    true
                );

                return;
            }


            /* =========================
               VALID LOGIN
            ========================== */

            setLoading(false);

            clearMessage();

            renderResult(
                student,
                resultData
            );

        }
    );

}


/* =========================================================
   RENDER RESULT
   ========================================================= */

function renderResult(student, data) {

    const school =
        data.school || {};

    const grading =
        data.grading || {};


    const subjects =
        Array.isArray(student.subjects)
            ? student.subjects
            : [];


    /* =========================
       SUBJECT ROWS
    ========================== */

    const rows =
        subjects
            .map(
                function (subject, index) {

                    const grade =
                        getGrade(
                            Number(subject.total),
                            grading
                        );


                    return `

                        <tr>

                            <td>
                                ${index + 1}
                            </td>

                            <td>
                                ${escapeHTML(
                                    subject.subject
                                )}
                            </td>

                            <td>
                                ${formatNumber(
                                    subject.ca
                                )}
                            </td>

                            <td>
                                ${formatNumber(
                                    subject.exam
                                )}
                            </td>

                            <td class="total-cell">
                                ${formatNumber(
                                    subject.total
                                )}
                            </td>

                            <td class="grade-cell">
                                ${grade}
                            </td>

                        </tr>

                    `;

                }
            )
            .join("");


    /* =========================
       RESULT HTML
    ========================== */

    resultSection.innerHTML = `

        <div class="result-sheet">

            <!-- RESULT HEADER -->

            <div class="result-header">

                <img
                    src="assets/kps-logo.png"
                    alt="School Logo"
                    class="result-logo"
                >

                <h1>
                    ${escapeHTML(
                        school.name ||
                        "De Kings Perfection Private School"
                    )}
                </h1>

                <h2>
                    ${escapeHTML(
                        school.motto ||
                        "Academic and Moral Excellence"
                    )}
                </h2>

                <p>
                    ${escapeHTML(
                        school.address || ""
                    )}
                </p>

                <div class="result-heading">
                    STUDENT ACADEMIC RESULT
                </div>

                <img
                    src="assets/stamp.webp"
                    alt="Verified Result"
                    class="verified-stamp"
                >

            </div>


            <!-- STUDENT DETAILS -->

            <div class="student-details">

                ${detail(
                    "Student Name",
                    student.name
                )}

                ${detail(
                    "Login ID",
                    student.login_id
                )}

                ${detail(
                    "Class",
                    student.class
                )}

                ${detail(
                    "Session",
                    student.session
                )}

                ${detail(
                    "Term",
                    student.term
                )}

                ${detail(
                    "Subjects",
                    subjects.length
                )}

                ${detail(
                    "Result Status",
                    "Verified"
                )}

                ${detail(
                    "Grade",
                    student.grade
                )}

            </div>


            <!-- SUMMARY -->

            <div class="summary-grid">

                <div class="summary-card">

                    <span>
                        Total Score
                    </span>

                    <strong>
                        ${formatNumber(
                            student.total
                        )}
                    </strong>

                </div>


                <div class="summary-card">

                    <span>
                        Average
                    </span>

                    <strong>
                        ${formatAverage(
                            student.average
                        )}%
                    </strong>

                </div>


                <div class="summary-card grade-card">

                    <span>
                        Overall Grade
                    </span>

                    <strong>
                        ${escapeHTML(
                            student.grade
                        )}
                    </strong>

                </div>

            </div>


            <!-- SUBJECT TABLE -->

            <div class="table-container">

                <table class="result-table">

                    <thead>

                        <tr>

                            <th>
                                #
                            </th>

                            <th>
                                Subject
                            </th>

                            <th>
                                CA
                            </th>

                            <th>
                                Exam
                            </th>

                            <th>
                                Total
                            </th>

                            <th>
                                Grade
                            </th>

                        </tr>

                    </thead>

                    <tbody>

                        ${rows}

                    </tbody>

                </table>

            </div>


            <!-- REMARKS -->

            <div class="remarks-grid">

                <div class="remark-box">

                    <div class="remark-title">
                        School Remark
                    </div>

                    <p>
                        ${escapeHTML(
                            student.school_remark ||
                            ""
                        )}
                    </p>

                </div>


                <div class="remark-box">

                    <div class="remark-title">
                        Teacher's Remark
                    </div>

                    <p>
                        ${escapeHTML(
                            student.teacher_remark ||
                            ""
                        )}
                    </p>

                </div>

            </div>


            <!-- RESULT FOOTER -->

            <div class="result-footer">

                <div class="result-footer-note">

                    <strong>
                        Official Result
                    </strong>

                    <br>

                    This result is generated from the
                    De Kings Perfection Private School
                    academic records for the
                    ${escapeHTML(
                        student.term
                    )}
                    of the
                    ${escapeHTML(
                        student.session
                    )}
                    academic session.

                </div>


                <div class="signature-area">

                    <div class="signature-line"></div>

                    <span>
                        Authorized School Official
                    </span>

                </div>

            </div>

        </div>


        <!-- ACTION BUTTONS -->

        <div class="result-actions">

            <button
                type="button"
                class="result-action-button print-button"
                id="printResultButton"
            >
                Print Result
            </button>


            <button
                type="button"
                class="result-action-button new-result-button"
                id="newResultButton"
            >
                Check Another Result
            </button>

        </div>

    `;


    /* =========================
       SHOW RESULT
    ========================== */

    resultSection.classList.add("show");


    /* =========================
       PRINT BUTTON
    ========================== */

    const printButton =
        document.getElementById(
            "printResultButton"
        );

    if (printButton) {

        printButton.addEventListener(
            "click",
            function () {

                window.print();

            }
        );

    }


    /* =========================
       NEW RESULT BUTTON
    ========================== */

    const newResultButton =
        document.getElementById(
            "newResultButton"
        );

    if (newResultButton) {

        newResultButton.addEventListener(
            "click",
            function () {

                clearResult();

            }
        );

    }


    /* =========================
       SCROLL TO RESULT
    ========================== */

    setTimeout(
        function () {

            resultSection.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

        },
        100
    );

}


/* =========================================================
   DETAIL HTML HELPER
   ========================================================= */

function detail(label, value) {

    return `

        <div class="detail">

            <span class="detail-label">
                ${escapeHTML(label)}
            </span>

            <span class="detail-value">
                ${escapeHTML(
                    value ?? ""
                )}
            </span>

        </div>

    `;

}


/* =========================================================
   GRADE CALCULATOR
   ========================================================= */

function getGrade(score, grading) {

    const numericScore =
        Number(score);


    if (
        !Number.isFinite(numericScore)
    ) {

        return "";

    }


    const gradeEntries =
        Object.entries(grading);


    /*
     * Sort highest minimum score first.
     */

    gradeEntries.sort(
        function (a, b) {

            return (
                Number(b[1].min) -
                Number(a[1].min)
            );

        }
    );


    for (
        const [grade, rule]
        of gradeEntries
    ) {

        if (
            numericScore >=
            Number(rule.min)
        ) {

            return grade;

        }

    }


    return "";

}


/* =========================================================
   FORMAT NUMBER
   ========================================================= */

function formatNumber(value) {

    const number =
        Number(value);


    if (
        !Number.isFinite(number)
    ) {

        return "0";

    }


    return number.toLocaleString(
        "en-US"
    );

}


/* =========================================================
   FORMAT AVERAGE
   ========================================================= */

function formatAverage(value) {

    const number =
        Number(value);


    if (
        !Number.isFinite(number)
    ) {

        return "0.00";

    }


    return number.toFixed(2);

}


/* =========================================================
   HTML ESCAPE
   ========================================================= */

function escapeHTML(value) {

    return String(value)

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );

}


/* =========================================================
   LOGIN MESSAGE
   ========================================================= */

function showMessage(
    message,
    isError = false
) {

    if (!loginMessage) {
        return;
    }

    loginMessage.textContent =
        message;

    loginMessage.style.color =
        isError
            ? "#9e1824"
            : "#138a57";

}


function clearMessage() {

    if (!loginMessage) {
        return;
    }

    loginMessage.textContent = "";

}


/* =========================================================
   LOADING
   ========================================================= */

function setLoading(isLoading) {

    if (!checkResultButton) {
        return;
    }


    if (isLoading) {

        checkResultButton.disabled =
            true;

        checkResultButton.classList.add(
            "loading"
        );

        buttonText.textContent =
            "Checking...";

    } else {

        checkResultButton.disabled =
            false;

        checkResultButton.classList.remove(
            "loading"
        );

        buttonText.textContent =
            "Check Result";

    }

}


/* =========================================================
   HIDE RESULT
   ========================================================= */

function hideResult() {

    if (!resultSection) {
        return;
    }

    resultSection.classList.remove(
        "show"
    );

    resultSection.innerHTML = "";

}


/* =========================================================
   CLEAR RESULT
   ========================================================= */

function clearResult() {

    hideResult();

    clearMessage();

    resultForm.reset();

    pinInput.type = "password";

    togglePin.textContent = "Show";

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


/* =========================================================
   WAIT HELPER
   ========================================================= */

function wait(milliseconds) {

    return new Promise(
        function (resolve) {

            setTimeout(
                resolve,
                milliseconds
            );

        }
    );

}