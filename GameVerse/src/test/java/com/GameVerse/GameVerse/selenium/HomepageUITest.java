package com.GameVerse.GameVerse.selenium;

import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.chrome.ChromeDriver;


public class HomepageUITest {

    @Test
    void userIsRedirectedToHomeAfterLogin() throws InterruptedException {
        WebDriver driver = new ChromeDriver();

        // Load login page
        driver.get("http://localhost:3000/login");

        // Fill in valid credentials
        driver.findElement(By.id("userinput")).sendKeys("capstonetest");
        driver.findElement(By.id("passinput")).sendKeys("1234");

        // Click login button
        driver.findElement(By.xpath("//button[contains(text(), 'Login')]")).click();

        // Give React a moment to redirect
        Thread.sleep(4000);

        // Assert redirect to /home
        assertTrue(driver.getCurrentUrl().contains("/home"));

        driver.quit();
    }

    @Test
    void protectedRouteRedirectsToLoginWhenNoToken() throws InterruptedException {
        WebDriver driver = new ChromeDriver();

        // Ensure no token exists
        driver.get("http://localhost:3000/logout"); // or manually clear
        driver.manage().deleteAllCookies();

        driver.get("http://localhost:3000/home");

        Thread.sleep(1500);

        assertTrue(driver.getCurrentUrl().contains("/login"));

        driver.quit();
    }



    @Test
    void splashScreenLoads() {
        WebDriver driver = new ChromeDriver();
        driver.get("http://localhost:3000/");

        WebElement splash = driver.findElement(By.tagName("h1"));
        assertTrue(splash.isDisplayed());

        driver.quit();
    }


    @Test
    void userCanNavigateToSignup() {
        WebDriver driver = new ChromeDriver();
        driver.get("http://localhost:3000/login");

        driver.findElement(By.linkText("Sign Up")).click();

        assertTrue(driver.getCurrentUrl().contains("/signup"));

        driver.quit();
    }


    @Test
    void userCanNavigateToExploreAfterLogin() throws InterruptedException {
        WebDriver driver = new ChromeDriver();
        driver.get("http://localhost:3000/login");

        driver.findElement(By.id("userinput")).sendKeys("capstonetest");
        driver.findElement(By.id("passinput")).sendKeys("1234");
        driver.findElement(By.xpath("//button[contains(text(), 'Login')]")).click();

        Thread.sleep(2000);

        driver.findElement(By.xpath("//a[contains(text(), 'Explore')]")).click();

        Thread.sleep(1000);

        assertTrue(driver.getCurrentUrl().contains("/explore"));

        driver.quit();
    }

    
}
