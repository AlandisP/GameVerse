package com.GameVerse.GameVerse.selenium;

import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.junit.jupiter.api.Assertions.*;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.chrome.ChromeDriver;

public class GeneralFrontendTest {

    // ------------------------------------------------------------------ //
    //  Helper: log in as the test user and wait for redirect to /home
    // ------------------------------------------------------------------ //
    private WebDriver loginAs(String username, String password) throws InterruptedException {
        WebDriver driver = new ChromeDriver();
        driver.get("http://localhost:3000/login");

        driver.findElement(By.id("userinput")).sendKeys(username);
        driver.findElement(By.id("passinput")).sendKeys(password);
        driver.findElement(By.xpath("//button[contains(text(), 'Login')]")).click();

        Thread.sleep(3000);
        return driver;
    }

    // ------------------------------------------------------------------ //
    //  Splash / public routes
    // ------------------------------------------------------------------ //

    @Test
    void splashScreenLoads() {
        WebDriver driver = new ChromeDriver();
        driver.get("http://localhost:3000/");

        WebElement splash = driver.findElement(By.tagName("h1"));
        assertTrue(splash.isDisplayed());

        driver.quit();
    }

    @Test
    void aboutPageLoads() throws InterruptedException {
        WebDriver driver = new ChromeDriver();
        driver.get("http://localhost:3000/about");

        Thread.sleep(1500);

        assertTrue(driver.getCurrentUrl().contains("/about"));

        driver.quit();
    }

    @Test
    void loginPageLoads() throws InterruptedException {
        WebDriver driver = new ChromeDriver();
        driver.get("http://localhost:3000/login");

        Thread.sleep(1000);

        assertTrue(driver.getCurrentUrl().contains("/login"));

        driver.quit();
    }

    @Test
    void signupPageLoads() throws InterruptedException {
        WebDriver driver = new ChromeDriver();
        driver.get("http://localhost:3000/signup");

        Thread.sleep(1000);

        assertTrue(driver.getCurrentUrl().contains("/signup"));

        driver.quit();
    }


    // ------------------------------------------------------------------ //
    //  Login behaviour
    // ------------------------------------------------------------------ //


    @Test
    void userIsRedirectedToHomeAfterLogin() throws InterruptedException {
        WebDriver driver = loginAs("capstonetest", "1234");

        assertTrue(driver.getCurrentUrl().contains("/home"));

        driver.quit();
    }

    @Test
    void sessionOnlyLoginClearsTokenOnReload() throws InterruptedException {
        WebDriver driver = new ChromeDriver();
        driver.get("http://localhost:3000");

        ((JavascriptExecutor) driver).executeScript(
            "localStorage.setItem('token', 'abc123');" +
            "localStorage.setItem('sessionOnly', 'true');" +
            "sessionStorage.clear();"
        );

        driver.navigate().refresh();
        Thread.sleep(1500);

        String token = (String)((JavascriptExecutor) driver)
            .executeScript("return localStorage.getItem('token');");

        assertTrue(token == null);

        driver.quit();
    }

    // ------------------------------------------------------------------ //
    //  Protected route guards — unauthenticated users should be redirected
    // ------------------------------------------------------------------ //

    private void assertRedirectsToLogin(String path) throws InterruptedException {
        WebDriver driver = new ChromeDriver();
        driver.get("http://localhost:3000");
        driver.manage().deleteAllCookies();
        ((JavascriptExecutor) driver).executeScript("localStorage.clear(); sessionStorage.clear();");

        driver.get("http://localhost:3000" + path);
        Thread.sleep(1500);

        assertTrue(
            driver.getCurrentUrl().contains("/login"),
            "Expected redirect to /login for path: " + path
        );

        driver.quit();
    }

    @Test
    void homeRedirectsToLoginWhenNoToken() throws InterruptedException {
        assertRedirectsToLogin("/home");
    }

    @Test
    void exploreRedirectsToLoginWhenNoToken() throws InterruptedException {
        assertRedirectsToLogin("/explore");
    }

    @Test
    void messagesRedirectsToLoginWhenNoToken() throws InterruptedException {
        assertRedirectsToLogin("/messages");
    }

    @Test
    void partyFinderRedirectsToLoginWhenNoToken() throws InterruptedException {
        assertRedirectsToLogin("/partyfinder");
    }

    @Test
    void communitiesRedirectsToLoginWhenNoToken() throws InterruptedException {
        assertRedirectsToLogin("/communities");
    }

    @Test
    void notificationsRedirectsToLoginWhenNoToken() throws InterruptedException {
        assertRedirectsToLogin("/notifications");
    }

    @Test
    void profileRedirectsToLoginWhenNoToken() throws InterruptedException {
        assertRedirectsToLogin("/profile");
    }

    @Test
    void settingsRedirectsToLoginWhenNoToken() throws InterruptedException {
        assertRedirectsToLogin("/settings");
    }

    // ------------------------------------------------------------------ //
    //  Authenticated navigation — each protected page loads after login
    // ------------------------------------------------------------------ //

    @Test
    void userCanNavigateToExplore() throws InterruptedException {
        WebDriver driver = loginAs("capstonetest", "1234");

        driver.findElement(By.xpath("//a[contains(text(), 'Explore')]")).click();
        Thread.sleep(1000);

        assertTrue(driver.getCurrentUrl().contains("/explore"));

        driver.quit();
    }

    @Test
    void userCanNavigateToMessages() throws InterruptedException {
        WebDriver driver = loginAs("capstonetest", "1234");

        driver.get("http://localhost:3000/messages");
        Thread.sleep(1500);

        assertTrue(driver.getCurrentUrl().contains("/messages"));

        driver.quit();
    }

    @Test
    void userCanNavigateToPartyFinder() throws InterruptedException {
        WebDriver driver = loginAs("capstonetest", "1234");

        driver.get("http://localhost:3000/partyfinder");
        Thread.sleep(1500);

        assertTrue(driver.getCurrentUrl().contains("/partyfinder"));

        driver.quit();
    }

    @Test
    void userCanNavigateToCommunities() throws InterruptedException {
        WebDriver driver = loginAs("capstonetest", "1234");

        driver.get("http://localhost:3000/communities");
        Thread.sleep(1500);

        assertTrue(driver.getCurrentUrl().contains("/communities"));

        driver.quit();
    }

    @Test
    void userCanNavigateToNotifications() throws InterruptedException {
        WebDriver driver = loginAs("capstonetest", "1234");

        driver.get("http://localhost:3000/notifications");
        Thread.sleep(1500);

        assertTrue(driver.getCurrentUrl().contains("/notifications"));

        driver.quit();
    }

    @Test
    void userCanNavigateToProfile() throws InterruptedException {
        WebDriver driver = loginAs("capstonetest", "1234");

        driver.get("http://localhost:3000/profile");
        Thread.sleep(1500);

        assertTrue(driver.getCurrentUrl().contains("/profile"));

        driver.quit();
    }

    @Test
    void userCanNavigateToProfileByUsername() throws InterruptedException {
        WebDriver driver = loginAs("vibecoder", "2190");

        driver.get("http://localhost:3000/profile/capstonetest");
        Thread.sleep(1500);

        assertTrue(driver.getCurrentUrl().contains("/profile/capstonetest"));

        driver.quit();
    }

    @Test
    void userCanNavigateToSettings() throws InterruptedException {
        WebDriver driver = loginAs("capstonetest", "1234");

        driver.get("http://localhost:3000/settings");
        Thread.sleep(1500);

        assertTrue(driver.getCurrentUrl().contains("/settings"));

        driver.quit();
    }

    @Test
    void messagesWithReceiverUsernameRouteLoads() throws InterruptedException {
        WebDriver driver = loginAs("capstonetest", "1234");

        driver.get("http://localhost:3000/messages/capstonetest");
        Thread.sleep(1500);

        assertTrue(driver.getCurrentUrl().contains("/messages/capstonetest"));

        driver.quit();
    }
}