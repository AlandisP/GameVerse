package com.GameVerse.GameVerse.selenium;

import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.chrome.ChromeDriver;

public class SettingsUITest {

    WebDriver loginAndGoToSettings() throws InterruptedException {
        WebDriver driver = new ChromeDriver();
        driver.get("http://localhost:3000/login");
        driver.findElement(By.id("userinput")).sendKeys("navbar");
        driver.findElement(By.id("passinput")).sendKeys("1234");
        driver.findElement(By.xpath("//button[contains(text(), 'Login')]")).click();
        Thread.sleep(4000);
        driver.get("http://localhost:3000/settings");
        Thread.sleep(2000);
        return driver;
    }

    @Test
    void settingsPageLoads() throws InterruptedException {
        WebDriver driver = loginAndGoToSettings();
        WebElement header = driver.findElement(By.xpath("//h1[contains(text(), 'Settings')]"));
        assertTrue(header.isDisplayed());
        driver.quit();
    }

    @Test
    void openChangePasswordModal() throws InterruptedException {
        WebDriver driver = loginAndGoToSettings();
        driver.findElement(By.xpath("//*[contains(text(), 'Change Password')]")).click();
        Thread.sleep(1500);
        WebElement modal = driver.findElement(By.xpath("//h2[contains(text(), 'Change Password')]"));
        assertTrue(modal.isDisplayed());
        driver.quit();
    }

    @Test
    void togglePrivateAccount() throws InterruptedException {
        WebDriver driver = loginAndGoToSettings();
        WebElement toggle = driver.findElement(By.className("toggle-btn"));
        toggle.click();
        Thread.sleep(1000);
        assertTrue(toggle.isDisplayed());
        driver.quit();
    }

    @Test
    void viewBookmarksModal() throws InterruptedException {
        WebDriver driver = loginAndGoToSettings();
        driver.findElement(By.xpath("//*[contains(text(), 'View Bookmarks')]")).click();
        Thread.sleep(2000);
        WebElement modal = driver.findElement(By.xpath("//h2[contains(text(), 'Bookmarks')]"));
        assertTrue(modal.isDisplayed());
        driver.quit();
    }
}
