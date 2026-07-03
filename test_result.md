#====================================================================================================
# START - Testing Protocol - DO NOT EDIT OR REMOVE THIS SECTION
#====================================================================================================

# THIS SECTION CONTAINS CRITICAL TESTING INSTRUCTIONS FOR BOTH AGENTS
# BOTH MAIN_AGENT AND TESTING_AGENT MUST PRESERVE THIS ENTIRE BLOCK

# Communication Protocol:
# If the `testing_agent` is available, main agent should delegate all testing tasks to it.
#
# You have access to a file called `test_result.md`. This file contains the complete testing state
# and history, and is the primary means of communication between main and the testing agent.
#
# Main and testing agents must follow this exact format to maintain testing data. 
# The testing data must be entered in yaml format Below is the data structure:
# 
## user_problem_statement: {problem_statement}
## backend:
##   - task: "Task name"
##     implemented: true
##     working: true  # or false or "NA"
##     file: "file_path.py"
##     stuck_count: 0
##     priority: "high"  # or "medium" or "low"
##     needs_retesting: false
##     status_history:
##         -working: true  # or false or "NA"
##         -agent: "main"  # or "testing" or "user"
##         -comment: "Detailed comment about status"
##
## frontend:
##   - task: "Task name"
##     implemented: true
##     working: true  # or false or "NA"
##     file: "file_path.js"
##     stuck_count: 0
##     priority: "high"  # or "medium" or "low"
##     needs_retesting: false
##     status_history:
##         -working: true  # or false or "NA"
##         -agent: "main"  # or "testing" or "user"
##         -comment: "Detailed comment about status"
##
## metadata:
##   created_by: "main_agent"
##   version: "1.0"
##   test_sequence: 0
##   run_ui: false
##
## test_plan:
##   current_focus:
##     - "Task name 1"
##     - "Task name 2"
##   stuck_tasks:
##     - "Task name with persistent issues"
##   test_all: false
##   test_priority: "high_first"  # or "sequential" or "stuck_first"
##
## agent_communication:
##     -agent: "main"  # or "testing" or "user"
##     -message: "Communication message between agents"

# Protocol Guidelines for Main agent
#
# 1. Update Test Result File Before Testing:
#    - Main agent must always update the `test_result.md` file before calling the testing agent
#    - Add implementation details to the status_history
#    - Set `needs_retesting` to true for tasks that need testing
#    - Update the `test_plan` section to guide testing priorities
#    - Add a message to `agent_communication` explaining what you've done
#
# 2. Incorporate User Feedback:
#    - When a user provides feedback that something is or isn't working, add this information to the relevant task's status_history
#    - Update the working status based on user feedback
#    - If a user reports an issue with a task that was marked as working, increment the stuck_count
#    - Whenever user reports issue in the app, if we have testing agent and task_result.md file so find the appropriate task for that and append in status_history of that task to contain the user concern and problem as well 
#
# 3. Track Stuck Tasks:
#    - Monitor which tasks have high stuck_count values or where you are fixing same issue again and again, analyze that when you read task_result.md
#    - For persistent issues, use websearch tool to find solutions
#    - Pay special attention to tasks in the stuck_tasks list
#    - When you fix an issue with a stuck task, don't reset the stuck_count until the testing agent confirms it's working
#
# 4. Provide Context to Testing Agent:
#    - When calling the testing agent, provide clear instructions about:
#      - Which tasks need testing (reference the test_plan)
#      - Any authentication details or configuration needed
#      - Specific test scenarios to focus on
#      - Any known issues or edge cases to verify
#
# 5. Call the testing agent with specific instructions referring to test_result.md
#
# IMPORTANT: Main agent must ALWAYS update test_result.md BEFORE calling the testing agent, as it relies on this file to understand what to test next.

#====================================================================================================
# END - Testing Protocol - DO NOT EDIT OR REMOVE THIS SECTION
#====================================================================================================



#====================================================================================================
# Testing Data - Main Agent and testing sub agent both should log testing data below this section
#====================================================================================================user_problem_statement: "Minecraft sunucum için oluşturuduğumuz bu sitede aynı zamanda yan iş olarak yaptığım plugin tasarımını da dahil etmek istiyorum. Bunun için bir wiki tarzı sayfaya ihtiyacım var sitenin herhangi bir yerinde tıklanmasına gerek yok sadece \"rexagon.com.tr/wiki/rexaprofile\" ve \"rexagon.com.tr/wiki/rexaeco\" uzantılarında birer wiki sayfası tasarlamanı istiyorum, bu tasarım sitenin tasarım diline uygun olsun. Admin paneli üzerinden bu wikiyi düzenlenebilir şekilde yapmanı istiyorum. \n\nAyrıca galeri bölümünde bir kaç sorun çekiyorum, resimleri yüklediğimde bazen resim yüklenmiyor geç geliyor gibi sorunlar oluyor. Veya bir resimi aynı isimde başka resim koymak istediğimde çakışmalar olabiliyor. Bu sorunların sebebi ön belleğe alma gibi bir şey olabilir bunu düzeltmeni istiyorum.\n\nAnasayfa da bulunan sıralamalar şu anda 2+2+2 şeklinde, bunu 3+3 şeklinde sığacak şekilde yeniden boyutlandırmanı istiyorum. Ayrıca En Çok Ada Seviyesi sıralamasındaki iç kutucuklar yazılar dolayısıyla diğerlerinden daha büyük gözüküyor bu kutucuklara max width verip hepsini eşit boyutta gözükmesini istiyorum.\n\nBir de forum kısmında verilen yanıtları beğenme ve yanıtı tekrar cevaplama ve alıntılama gelmesini istiyorum. Ve forumda konu açarken resim eklenebilir olmasını istiyorum. Bu resimleri ayrı bir dosyada sıkıştırılmış şekilde tutulmasını istiyorum, ve yüklenen resimler 3mb'dan büyük olamaz."
backend:
  - task: "Galeri yükleme resim uuid atama"
    implemented: true
    working: true
    file: "backend/server.py"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
  - task: "Wiki endpointleri (GET/POST/DELETE)"
    implemented: true
    working: true
    file: "backend/server.py"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
  - task: "Forum konu/cevap upload image"
    implemented: true
    working: true
    file: "backend/server.py"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
  - task: "Forum cevap begenme / alintilama backend state"
    implemented: true
    working: true
    file: "backend/server.py"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
frontend:
  - task: "Admin sayfası wiki yönetimi tab'i"
    implemented: true
    working: true
    file: "frontend/src/pages/AdminPage.js"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
  - task: "Wiki page görüntüleme"
    implemented: true
    working: true
    file: "frontend/src/pages/WikiPage.js"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
  - task: "Ana sayfa leaderboard 3 column grid"
    implemented: true
    working: true
    file: "frontend/src/pages/HomePage.js"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
  - task: "Forum konu/cevaplarda resim butonu (max 3mb) ve begen/alintila butonlari"
    implemented: true
    working: true
    file: "frontend/src/pages/ForumKategoriPage.js, frontend/src/pages/ForumKonuPage.js"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
  - task: "Shopier bakiye paketleri ve OSB callback ile bakiye yükleme"
    implemented: true
    working: true
    file: "backend/server.py, frontend/src/pages/CuzdanPage.js, frontend/src/App.js"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
        -working: "NA"
        -agent: "main"
        -comment: "Shopier direct payment link integration with OSB webhook. Backend endpoints: GET /api/shopier/paketler, POST /api/shopier/odeme-baslat (creates pending tx, returns payment URL with platform_order_id), POST /api/shopier/osb-callback (verifies HMAC-SHA256, matches by platform_order_id + customernote username, adds balance), GET /api/shopier/transaction/{id} (status polling). Frontend: package cards (25/50 aktif, 100/200/500 aktif=false), username display for order note, auto-polling after payment. Manual simulated OSB tests passed: correct hash adds balance, wrong hash returns 401, missing params returns 401, username mismatch marks tx as 'incelemede'."
        -working: true
        -agent: "testing"
        -comment: "Comprehensive backend testing completed. All 10 test scenarios passed: (1) GET /api/shopier/paketler returns 5 packages with correct aktif status [25=true, 50=true, 100/200/500=false]. (2) POST /api/shopier/odeme-baslat?tutar=25 returns correct payment URL with 48373478 link. (3) POST /api/shopier/odeme-baslat?tutar=50 returns correct payment URL with 48373534 link. (4) POST /api/shopier/odeme-baslat?tutar=100 correctly rejects inactive package with 400 error. (5) POST /api/shopier/odeme-baslat?tutar=99 correctly rejects invalid amount with 400 error. (6a) Valid OSB callback with correct HMAC-SHA256 signature successfully adds 25 TL to balance and marks transaction as 'onaylandi'. (6b) OSB callback with wrong signature correctly returns 401 Unauthorized. (6c) OSB callback with missing parameters correctly returns 401 Missing parameter. (6d) OSB callback with username mismatch correctly marks transaction as 'incelemede' without increasing balance. (7) GET /api/shopier/transaction/{id} correctly returns 404 for non-existent transactions. All authentication, payment flow, webhook validation, and security checks working correctly."
metadata:
  created_by: "main_agent"
  version: "1.0"
  test_sequence: 2
  run_ui: false

test_plan:
  current_focus:
    - "Shopier bakiye paketleri ve OSB callback ile bakiye yükleme"
  stuck_tasks: []
  test_all: false
  test_priority: "high_first"

agent_communication:
    -agent: "main"
    -message: "Shopier OSB integration implemented. All backend endpoints ready for testing: paketler listing, odeme-baslat, osb-callback webhook, and transaction status polling."
    -agent: "testing"
    -message: "Shopier OSB integration testing completed successfully. All 10 test scenarios passed including: package listing, payment initiation (25/50 TL active, 100/200/500 inactive), invalid amount rejection, OSB webhook with HMAC-SHA256 validation, balance updates, username mismatch detection, and transaction status queries. Backend implementation is fully functional and secure. No issues found."
