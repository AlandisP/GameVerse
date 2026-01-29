package com.GameVerse.GameVerse.selenium;

import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.chrome.ChromeDriver;


public class HomepageUITest {
    @Test
    void homepageLoads() {
        WebDriver driver = new ChromeDriver();
        driver.get("http://localhost:3000");

        WebElement element = driver.findElement(By.tagName("h1"));
        assertTrue(element.isDisplayed());

        driver.quit();
    }

    @Test
    void userCanLogin() {
        WebDriver driver = new ChromeDriver();
        driver.get("http://localhost:3000");

        driver.findElement(By.xpath("//input[@placeholder='Username']")).sendKeys("testuser");

        driver.findElement(By.xpath("//input[@placeholder='Password']")).sendKeys("password123");
        driver.findElement(By.xpath("//button[contains(text(), 'Login')]")).click();

        WebElement element = driver.findElement(By.xpath("//*[contains(text(), 'Welcome')]"));
        assertTrue(element.isDisplayed());

        driver.quit();
    }

    @Test
    void userIsRedirectedToHomeAfterLogin() throws InterruptedException {
        WebDriver driver = new ChromeDriver();

        // Load login page
        driver.get("http://localhost:3000");

        // Fill in valid credentials
        driver.findElement(By.id("userinput")).sendKeys("navbar");
        driver.findElement(By.id("passinput")).sendKeys("1234");

        // Click login button
        driver.findElement(By.xpath("//button[contains(text(), 'Login')]")).click();

        // Give React a moment to redirect
        Thread.sleep(4000);

        // Assert redirect to /home
        assertTrue(driver.getCurrentUrl().contains("/home"));

        driver.quit();
    }



    
}
